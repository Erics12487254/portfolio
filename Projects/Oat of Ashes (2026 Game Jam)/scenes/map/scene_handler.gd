extends Node

@export var main_menu_packed: PackedScene
@export var game_scene_packed: PackedScene
@export var end_game_packed: PackedScene

var main_menu: Control
var game_scene: Node2D
var end_game_screen: Control


func _ready() -> void:
	load_main_menu()


func load_main_menu() -> void:
	_remove_end_game_screen()
	_remove_game()
	get_tree().paused = false
	if main_menu != null:
		return

	main_menu = main_menu_packed.instantiate() as Control
	main_menu.connect("new_game_pressed", new_game)
	main_menu.connect("load_game_pressed", load_game)
	main_menu.connect("exit_pressed", quit)
	add_child(main_menu)


func new_game(_origin: String = "") -> void:
	_remove_end_game_screen()
	_remove_main_menu()
	_remove_game()
	get_tree().paused = false

	game_scene = game_scene_packed.instantiate() as Node2D
	game_scene.connect("player_died", show_end_game_screen)
	add_child(game_scene)


func load_game(_origin: String) -> void:
	# Save-game loading has not been implemented yet.
	pass


func quit(_origin: String) -> void:
	get_tree().quit()


func show_end_game_screen() -> void:
	if game_scene == null or end_game_screen != null:
		return

	# Wait 1 second before showing the end game screen
	await get_tree().create_timer(1.0).timeout

	# Re-check state in case state changed during the delay
	if game_scene == null or end_game_screen != null:
		return

	end_game_screen = end_game_packed.instantiate() as Control
	end_game_screen.connect("replay_pressed", new_game)
	end_game_screen.connect("main_menu_pressed", load_main_menu)

	var canvas_layer := CanvasLayer.new()
	canvas_layer.name = "EndGameCanvas"
	canvas_layer.add_child(end_game_screen)
	add_child(canvas_layer)


func _remove_main_menu() -> void:
	if main_menu != null:
		main_menu.queue_free()
		main_menu = null


func _remove_game() -> void:
	if game_scene != null:
		game_scene.queue_free()
		game_scene = null


func _remove_end_game_screen() -> void:
	if end_game_screen != null:
		var parent = end_game_screen.get_parent()
		if parent is CanvasLayer:
			parent.queue_free()
		else:
			end_game_screen.queue_free()
		end_game_screen = null
