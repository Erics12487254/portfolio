extends Control

@onready var result_label: Label = $VB/Result


func display_wave(text_to_show: String) -> void:
	# Set the label text
	result_label.text = text_to_show
	
	# Start fully invisible
	modulate.a = 0.0
	
	# Create a smooth fade-in and fade-out transition
	var tween := create_tween()
	tween.tween_property(self, "modulate:a", 1.0, 0.3) # Fade in over 0.3s
	tween.tween_interval(1.0)                          # Hold for 1 second
	tween.tween_property(self, "modulate:a", 0.0, 0.3) # Fade out over 0.3s
	
	# Automatically remove node when done
	await tween.finished
	queue_free()
