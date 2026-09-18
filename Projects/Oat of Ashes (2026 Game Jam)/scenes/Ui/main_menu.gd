extends Control

signal new_game_pressed(origin: String)
signal load_game_pressed(origin: String)
signal exit_pressed(origin: String)

func _on_new_game_pressed() -> void:
	new_game_pressed.emit("main_menu")


func _on_load_game_pressed() -> void:
	load_game_pressed.emit("main_menu")


func _on_exit_pressed() -> void:
	exit_pressed.emit("main_menu")
