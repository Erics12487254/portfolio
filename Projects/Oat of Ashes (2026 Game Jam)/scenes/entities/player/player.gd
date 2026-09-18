extends CharacterBody2D

signal died

enum State { IDLE, RUN, ATTACK, DEATH }

@export_category("Stats")
@export var hitpoints: int = 200
@export var max_hitpoints: int = 200
@export var speed: int = 400
@export var attack_speed: float = 0.6
@export var attack_damage: int = 60
@export var damage_invulnerability_time: float = 0.35
@export var death_packed: PackedScene

var state: State = State.IDLE
var move_direction: Vector2 = Vector2.ZERO
var facing_direction: Vector2 = Vector2.DOWN
var is_dead := false
var is_invulnerable := false

@onready var sprite_2d: Sprite2D = $Sprite2D
@onready var animation_tree: AnimationTree = $AnimationTree
@onready var hitbox: Area2D = $hitbox
@onready var sword_audio: AudioStreamPlayer2D = $AudioStreamPlayer2D
var animation_playback: AnimationNodeStateMachinePlayback

func _ready() -> void:
	add_to_group("player")
	animation_tree.active = true
	animation_playback = animation_tree.get("parameters/playback")
	_create_health_bar()

	# Instant-snap camera to player position on spawn
	var camera := get_node_or_null("Camera2D") as Camera2D
	if camera != null:
		camera.reset_smoothing()
		camera.force_update_scroll()

func _unhandled_input(event: InputEvent) -> void:
	if not is_dead and event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		attack()

func _physics_process(_delta: float) -> void:
	if not is_dead and state != State.ATTACK:
		movement_loop()

func movement_loop() -> void:
	move_direction.x = int(Input.is_action_pressed("right")) - int(Input.is_action_pressed("left"))
	move_direction.y = int(Input.is_action_pressed("down")) - int(Input.is_action_pressed("up"))

	var motion = move_direction.normalized() * speed
	velocity = motion
	move_and_slide()

	# Only update facing direction based on movement if we aren't attacking
	if move_direction != Vector2.ZERO:
		facing_direction = _cardinal_direction(move_direction)

	if motion != Vector2.ZERO and state == State.IDLE:
		state = State.RUN
		update_animation()
	elif motion == Vector2.ZERO and state == State.RUN:
		state = State.IDLE
		update_animation()

	if state in [State.IDLE, State.RUN]:
		if facing_direction.x < 0.0:
			sprite_2d.flip_h = true
		elif facing_direction.x > 0.0:
			sprite_2d.flip_h = false

func update_animation() -> void:
	match state:
		State.IDLE:
			animation_playback.travel("idle")
		State.RUN:
			animation_playback.travel("run")
		State.ATTACK:
			animation_playback.travel("attack")

func attack() -> void:
	if is_dead or state == State.ATTACK:
		return

	state = State.ATTACK
	sword_audio.play()

	# 1. Get mouse position in global coordinates and calculate direction to it
	var mouse_pos := get_global_mouse_position()
	var mouse_direction := global_position.direction_to(mouse_pos)
	
	# 2. Convert raw mouse vector into a strict cardinal direction (UP, DOWN, LEFT, RIGHT)
	facing_direction = _cardinal_direction(mouse_direction)

	# 3. Handle sprite flipping based on where the mouse is clicked
	if facing_direction.x < 0.0:
		sprite_2d.flip_h = true
	elif facing_direction.x > 0.0:
		sprite_2d.flip_h = false

	var blend_pos := facing_direction

	animation_tree.set("parameters/attack/BlendSpace2D/blend_position", blend_pos)
	hitbox.monitoring = false
	_set_attack_hitbox(blend_pos)
	animation_playback.travel("attack")

	# Each directional animation enables the hitbox during its impact frames.
	await get_tree().create_timer(attack_speed).timeout
	hitbox.monitoring = false
	state = State.IDLE
	update_animation()


func _cardinal_direction(direction: Vector2) -> Vector2:
	if absf(direction.x) > absf(direction.y):
		return Vector2.RIGHT if direction.x > 0.0 else Vector2.LEFT
	return Vector2.DOWN if direction.y > 0.0 else Vector2.UP


func _set_attack_hitbox(direction: Vector2) -> void:
	# Character origins are at their feet; keep the strike centred on the target's body.
	var body_offset := Vector2(0.0, -34.0)
	if abs(direction.x) > abs(direction.y):
		hitbox.position = body_offset + Vector2(direction.x * 42.0, 0.0)
		hitbox.rotation = 0.0
	else:
		hitbox.position = body_offset + Vector2(0.0, direction.y * 42.0)
		hitbox.rotation = PI * 0.5


func _on_hitbox_area_entered(area: Area2D) -> void:
	var target := area.get_parent()
	if target != null and target.has_method("take_damage"):
		target.take_damage(attack_damage)


func take_damage(damage_taken: int) -> void:
	if is_dead or is_invulnerable or damage_taken <= 0:
		return

	hitpoints = max(0, hitpoints - damage_taken)
	_update_health_bar()
	if hitpoints == 0:
		is_dead = true
		state = State.DEATH
		velocity = Vector2.ZERO
		hitbox.monitoring = false
		remove_from_group("player")
		_detach_camera()
		died.emit()
		_play_death_effect()
		queue_free()
		return

	is_invulnerable = true
	var original_modulate := sprite_2d.modulate
	sprite_2d.modulate = Color(1.0, 0.45, 0.45, 1.0)
	await get_tree().create_timer(damage_invulnerability_time).timeout
	if not is_dead:
		sprite_2d.modulate = original_modulate
		is_invulnerable = false


func restore_health(amount: int) -> void:
	if is_dead or amount <= 0:
		return

	hitpoints = min(max_hitpoints, hitpoints + amount)
	_update_health_bar()


func _create_health_bar() -> void:
	var health_bar := ProgressBar.new()
	health_bar.name = "HealthBar"
	health_bar.max_value = max_hitpoints
	health_bar.value = hitpoints
	health_bar.show_percentage = false
	health_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	health_bar.position = Vector2(-36.0, -104.0)
	health_bar.size = Vector2(72.0, 8.0)
	var background := StyleBoxFlat.new()
	background.bg_color = Color(0.04, 0.06, 0.12, 0.9)
	var fill := StyleBoxFlat.new()
	fill.bg_color = Color(0.12, 0.8, 0.25, 1.0)
	health_bar.add_theme_stylebox_override("background", background)
	health_bar.add_theme_stylebox_override("fill", fill)
	add_child(health_bar)


func _update_health_bar() -> void:
	var health_bar := get_node_or_null("HealthBar") as ProgressBar
	if health_bar != null:
		health_bar.value = hitpoints


func _play_death_effect() -> void:
	if death_packed == null:
		return

	var death_scene := death_packed.instantiate() as Node2D
	var effects := get_tree().current_scene.get_node_or_null("effects") as Node2D
	if effects != null:
		effects.add_child(death_scene)
	else:
		get_parent().add_child(death_scene)
	death_scene.global_position = global_position + Vector2(0.0, -32.0)


func _detach_camera() -> void:
	var camera := get_node_or_null("Camera2D") as Camera2D
	if camera != null:
		var cam_pos := camera.global_position
		remove_child(camera)
		get_parent().add_child(camera)
		camera.global_position = cam_pos
