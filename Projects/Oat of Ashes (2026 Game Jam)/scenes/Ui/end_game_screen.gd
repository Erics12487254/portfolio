extends Control

signal replay_pressed
signal main_menu_pressed

@onready var result_label: Label = $VB/Result
@onready var audio_player: AudioStreamPlayer = $AudioStreamPlayer # 1. Added reference to the sound node

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	audio_player.play() # 2. Added this line to play the sound automatically when the screen opens

func set_result_text(text: String) -> void:
	result_label.text = text

func _on_replay_pressed() -> void:
	replay_pressed.emit()

func _on_main_menu_pressed() -> void:
	main_menu_pressed.emit()
