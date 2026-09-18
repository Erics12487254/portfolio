extends Node2D

func _ready() -> void:
	var tween := create_tween()
	tween.tween_property(self, "scale", Vector2(1.35, 1.35), 0.35)
	tween.parallel().tween_property(self, "modulate:a", 0.0, 0.35)
	tween.tween_callback(queue_free)
