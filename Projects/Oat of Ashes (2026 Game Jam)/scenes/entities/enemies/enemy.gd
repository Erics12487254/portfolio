extends CharacterBody2D

@export_category("Stats")
@export var hitpoints: int = 180
@export var move_speed: float = 140.0
@export var detection_radius: float = 260.0
@export var attack_range: float = 78.0
@export var attack_damage: int = 25
@export var attack_windup: float = 0.25
@export var attack_cooldown: float = 0.8
@export_category("related scenes")
@export var death_packed: PackedScene
@export var heart_pickup_packed: PackedScene

var is_dead := false
var is_attacking := false
var is_hit_flashing := false

@onready var sprite_2d: Sprite2D = $Sprite2D
@onready var animation_tree: AnimationTree = $AnimationTree
var animation_playback: AnimationNodeStateMachinePlayback


func _ready() -> void:
	add_to_group("enemies")
	animation_tree.active = true
	animation_playback = animation_tree.get("parameters/playback")
	_create_health_bar()


func _physics_process(_delta: float) -> void:
	if is_dead or is_attacking:
		return

	var player := get_tree().get_first_node_in_group("player") as Node2D
	if player == null or not is_instance_valid(player):
		_stop_and_idle()
		return

	var offset := player.global_position - global_position
	var distance := offset.length()
	if distance > detection_radius:
		_stop_and_idle()
		return

	if distance <= attack_range:
		attack(player, offset)
		return

	velocity = offset.normalized() * move_speed
	if abs(offset.x) > 0.01:
		sprite_2d.flip_h = offset.x < 0.0
	animation_playback.travel("run")
	move_and_slide()


func _stop_and_idle() -> void:
	velocity = Vector2.ZERO
	if animation_playback != null:
		animation_playback.travel("idle")


func attack(player: Node2D, offset: Vector2) -> void:
	is_attacking = true
	velocity = Vector2.ZERO

	var direction := _cardinal_direction(offset)
	if direction.x != 0.0:
		sprite_2d.flip_h = direction.x < 0.0
	animation_tree.set("parameters/attack/BlendSpace2D/blend_position", direction)
	animation_playback.travel("attack")

	await get_tree().create_timer(attack_windup).timeout
	if not is_dead and is_instance_valid(player) and global_position.distance_to(player.global_position) <= attack_range:
		if player.has_method("take_damage"):
			player.take_damage(attack_damage)

	await get_tree().create_timer(maxf(0.0, attack_cooldown - attack_windup)).timeout
	is_attacking = false


func _cardinal_direction(offset: Vector2) -> Vector2:
	if abs(offset.x) > abs(offset.y):
		return Vector2.RIGHT if offset.x >= 0.0 else Vector2.LEFT
	return Vector2.DOWN if offset.y >= 0.0 else Vector2.UP

func take_damage(damage_taken: int) -> void:
	if is_dead or damage_taken <= 0:
		return

	hitpoints = max(0, hitpoints - damage_taken)
	_update_health_bar()
	_flash_on_hit()
	if hitpoints <= 0:
		death()
		
func death() -> void:
	if is_dead:
		return

	is_dead = true
	velocity = Vector2.ZERO
	_spawn_heart_pickup()
	if death_packed == null:
		queue_free()
		return

	var death_scene: Node2D = death_packed.instantiate()
	var effects := get_tree().current_scene.get_node_or_null("effects") as Node2D
	if effects != null:
		effects.add_child(death_scene)
	else:
		get_parent().add_child(death_scene)
	death_scene.global_position = global_position + Vector2(0.0, -32.0)
	queue_free()


func _spawn_heart_pickup() -> void:
	if heart_pickup_packed == null:
		return

	var heart := heart_pickup_packed.instantiate() as Area2D
	get_parent().add_child(heart)
	heart.global_position = global_position


func _create_health_bar() -> void:
	var health_bar := ProgressBar.new()
	health_bar.name = "HealthBar"
	health_bar.max_value = hitpoints
	health_bar.value = hitpoints
	health_bar.show_percentage = false
	health_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	health_bar.position = Vector2(-32.0, -96.0)
	health_bar.size = Vector2(64.0, 7.0)
	var background := StyleBoxFlat.new()
	background.bg_color = Color(0.12, 0.02, 0.02, 0.9)
	background.corner_radius_top_left = 2
	background.corner_radius_top_right = 2
	background.corner_radius_bottom_left = 2
	background.corner_radius_bottom_right = 2
	var fill := StyleBoxFlat.new()
	fill.bg_color = Color(0.9, 0.12, 0.1, 1.0)
	fill.corner_radius_top_left = 2
	fill.corner_radius_top_right = 2
	fill.corner_radius_bottom_left = 2
	fill.corner_radius_bottom_right = 2
	health_bar.add_theme_stylebox_override("background", background)
	health_bar.add_theme_stylebox_override("fill", fill)
	add_child(health_bar)


func _update_health_bar() -> void:
	var health_bar := get_node_or_null("HealthBar") as ProgressBar
	if health_bar != null:
		health_bar.value = hitpoints


func _flash_on_hit() -> void:
	if is_hit_flashing:
		return
	is_hit_flashing = true
	sprite_2d.modulate = Color(1.0, 0.25, 0.25, 1.0)
	await get_tree().create_timer(0.14).timeout
	if not is_dead:
		sprite_2d.modulate = Color.WHITE
	is_hit_flashing = false
