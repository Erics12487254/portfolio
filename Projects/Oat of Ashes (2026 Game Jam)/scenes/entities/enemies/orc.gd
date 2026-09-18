extends CharacterBody2D

## Orc version of enemy.gd. It keeps the same boss rules and exports, but uses
## the directional AnimatedSprite2D frames embedded in TheOrc.tscn.

@export_category("Stats")
@export var hitpoints: int = 250
@export var move_speed: float = 115.0
@export var detection_radius: float = 300.0
@export var attack_range: float = 90.0
@export var attack_damage: int = 25
@export var attack_windup: float = 0.35
@export var attack_cooldown: float = 1.1

@export_category("Related Scenes")
@export var death_packed: PackedScene
@export var heart_pickup_packed: PackedScene

signal defeated

var is_dead := false
var is_attacking := false
var is_hit_flashing := false
var facing := "down"

@onready var orc_sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var hurtbox: Area2D = $Hurtbox
@onready var attack_hitbox: Area2D = $AttackHitbox


func _ready() -> void:
	add_to_group("enemies")
	add_to_group("boss")
	attack_hitbox.monitoring = false
	_play("idle_down")
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

	_update_facing(offset)
	if distance <= attack_range:
		attack(player)
		return

	velocity = offset.normalized() * move_speed
	_play("run_%s" % facing)
	move_and_slide()


func _stop_and_idle() -> void:
	velocity = Vector2.ZERO
	_play("idle_%s" % facing)


func attack(player: Node2D) -> void:
	is_attacking = true
	velocity = Vector2.ZERO
	_play("atk_%s" % facing)

	await get_tree().create_timer(attack_windup).timeout
	if not is_dead and is_instance_valid(player) and global_position.distance_to(player.global_position) <= attack_range:
		if player.has_method("take_damage"):
			player.call("take_damage", attack_damage)

	await get_tree().create_timer(maxf(0.0, attack_cooldown - attack_windup)).timeout
	if not is_dead:
		is_attacking = false


func take_damage(damage_taken: int) -> void:
	if is_dead or damage_taken <= 0:
		return

	hitpoints = max(0, hitpoints - damage_taken)
	_update_health_bar()
	_flash_on_hit()
	if hitpoints <= 0:
		death()
	else:
		_play("hurt_%s" % facing)


func death() -> void:
	if is_dead:
		return

	is_dead = true
	velocity = Vector2.ZERO
	hurtbox.set_deferred("monitoring", false)
	attack_hitbox.monitoring = false
	_spawn_heart_pickup()
	defeated.emit()

	if death_packed != null:
		var death_scene := death_packed.instantiate() as Node2D
		var effects := get_tree().current_scene.get_node_or_null("effects") as Node2D
		if effects != null:
			effects.add_child(death_scene)
		else:
			get_parent().add_child(death_scene)
		death_scene.global_position = global_position + Vector2(0.0, -32.0)
		queue_free()
		return

	var death_animation := "death_%s" % facing
	_play(death_animation)
	var death_fps := orc_sprite.sprite_frames.get_animation_speed(death_animation)
	var death_duration := float(orc_sprite.sprite_frames.get_frame_count(death_animation)) / maxf(death_fps, 1.0)
	await get_tree().create_timer(death_duration).timeout
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
	health_bar.position = Vector2(-36.0, -96.0)
	health_bar.size = Vector2(72.0, 7.0)
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
	orc_sprite.modulate = Color(1.0, 0.25, 0.25, 1.0)
	await get_tree().create_timer(0.14).timeout
	if not is_dead:
		orc_sprite.modulate = Color.WHITE
	is_hit_flashing = false


func _update_facing(offset: Vector2) -> void:
	if absf(offset.x) > absf(offset.y):
		facing = "right" if offset.x >= 0.0 else "left"
	else:
		facing = "down" if offset.y >= 0.0 else "up"


func _play(animation_name: String) -> void:
	if orc_sprite.animation != animation_name:
		orc_sprite.play(animation_name)


func _on_hurtbox_area_entered(area: Area2D) -> void:
	if area.has_method("get_damage"):
		take_damage(int(area.call("get_damage")))
	elif area.get("damage") != null:
		take_damage(int(area.get("damage")))


func _on_attack_hitbox_body_entered(_body: Node2D) -> void:
	# Damage is applied during attack() like enemy.gd. The hitbox remains in the
	# scene for collision-layer setup and future melee overlap effects.
	pass
