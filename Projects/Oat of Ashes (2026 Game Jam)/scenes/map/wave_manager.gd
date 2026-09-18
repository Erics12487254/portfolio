extends Node2D

signal player_died

@export var wave_declare_scene: PackedScene
@export var player_scene: PackedScene
@export var enemy_scene: PackedScene
@export var orc_scene: PackedScene
@export var spawn_effect_scene: PackedScene
@export var total_waves := 1
@export var minimum_enemies_per_wave := 2
@export var maximum_enemies_per_wave := 7
@export var player_spawn_position := Vector2(242, 232)
@export var victory_scene: PackedScene

# Explicitly link to the pure ground tile map layer node
@onready var ground: TileMapLayer = $ground
@onready var enemies: Node2D = $enemies
@onready var effects: Node2D = $effects
@onready var ui: CanvasLayer = $UI
@onready var level_bg_music: AudioStreamPlayer = $AudioStreamPlayer 

var current_wave := 0


func _ready() -> void:
	randomize()
	
	# Play background music right when the level scene starts
	level_bg_music.play()
	
	# Step 1: Wait 1 second after scene load
	await get_tree().create_timer(1.0).timeout
	
	# Step 2: Spawn Hero
	_spawn_player()
	
	# Step 3: Wait 1 second
	await get_tree().create_timer(1.0).timeout
	
	# Step 4: Spawn Enemies / Start Waves
	await _run_waves()
	
	# All waves cleared -> show victory
	_show_victory_screen()
	
func _show_victory_screen() -> void:
	if victory_scene == null:
		return

	var victory_ui := victory_scene.instantiate()
	ui.add_child(victory_ui)

	victory_ui.set_result_text("Victory!")

	victory_ui.replay_pressed.connect(_on_replay_pressed)
	victory_ui.main_menu_pressed.connect(_on_main_menu_pressed)

	get_tree().paused = true


func _on_replay_pressed() -> void:
	get_tree().paused = false
	var scene_handler := get_tree().current_scene
	if scene_handler != null and scene_handler.has_method("new_game"):
		scene_handler.call_deferred("new_game")
		return
	get_tree().reload_current_scene()


func _on_main_menu_pressed() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/map/scene_handler.tscn")
	

func _spawn_player() -> void:
	var player := player_scene.instantiate() as Node2D
	add_child(player)
	player.connect("died", _on_player_died)
	player.global_position = _player_spawn_position_on_ground()
	_spawn_effect(player.global_position)


func _on_player_died() -> void:
	player_died.emit()


func _player_spawn_position_on_ground() -> Vector2:
	if _is_on_ground_tile(player_spawn_position):
		return player_spawn_position
	return _random_ground_position()


func _run_waves() -> void:
	for wave in range(1, total_waves + 1):
		current_wave = wave
		
		# Display Wave Announcement before spawning enemies
		await _show_wave_announcement(wave)
		
		var enemy_count := randi_range(minimum_enemies_per_wave, maximum_enemies_per_wave) + wave - 1
		for enemy_number in range(enemy_count):
			_spawn_enemy()

		if wave == total_waves:
			_spawn_orc()
			
		while not get_tree().get_nodes_in_group("enemies").is_empty():
			await get_tree().create_timer(0.4).timeout
			
		await get_tree().create_timer(1.0).timeout


func _show_wave_announcement(wave_number: int) -> void:
	if wave_declare_scene == null:
		return
		
	var wave_ui := wave_declare_scene.instantiate()
	ui.add_child(wave_ui)
	
	# Determine message
	var message := ""
	if wave_number == total_waves:
		message = "Final Wave"
	else:
		message = "Wave " + str(wave_number)
		
	await wave_ui.display_wave(message)


func _spawn_enemy() -> void:
	var enemy := enemy_scene.instantiate() as Node2D
	var spawn_position := _random_enemy_spawn_position()
	enemies.add_child(enemy)
	enemy.global_position = spawn_position
	_spawn_effect(enemy.global_position)


func _spawn_orc() -> void:
	if orc_scene == null:
		push_warning("Final wave has no Orc scene assigned.")
		return

	var orc := orc_scene.instantiate() as Node2D
	var spawn_position := _random_enemy_spawn_position()
	enemies.add_child(orc)
	orc.global_position = spawn_position
	_spawn_effect(orc.global_position)


func _random_enemy_spawn_position() -> Vector2:
	return _random_ground_position()


func _random_ground_position() -> Vector2:
	var used_cells := ground.get_used_cells()
	if used_cells.is_empty():
		push_warning("Pure Ground TileMapLayer has no cells! Defaulting to Vector2.ZERO")
		return Vector2.ZERO
	
	# Grab a random coordinate exclusively from the dedicated 'ground' layer
	var random_cell: Vector2i = used_cells.pick_random()
	
	# Convert grid space to world space coordinates using the ground layer
	return ground.to_global(ground.map_to_local(random_cell))


func _is_on_ground_tile(world_position: Vector2) -> bool:
	var cell := ground.local_to_map(ground.to_local(world_position))
	return ground.get_cell_source_id(cell) != -1


func _spawn_effect(world_position: Vector2) -> void:
	var effect := spawn_effect_scene.instantiate() as Node2D
	effects.add_child(effect)
	effect.global_position = world_position
