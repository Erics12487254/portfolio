extends Area2D

@export var healing_amount := 40
@export var lifetime := 12.0

var elapsed := 0.0
var collected := false
var base_sprite_position := Vector2.ZERO

@onready var sprite: Sprite2D = $Sprite2D
@onready var audio_player: AudioStreamPlayer2D = $AudioStreamPlayer2D


func _ready() -> void:
	base_sprite_position = sprite.position
	body_entered.connect(_on_body_entered)
	get_tree().create_timer(lifetime).timeout.connect(queue_free)


func _process(delta: float) -> void:
	elapsed += delta
	sprite.position = base_sprite_position + Vector2(0.0, sin(elapsed * 5.0) * 3.0)
	var pulse := 1.0 + sin(elapsed * 5.0) * 0.08
	sprite.scale = Vector2.ONE * pulse


func _on_body_entered(body: Node2D) -> void:
	if collected or not body.is_in_group("player") or not body.has_method("restore_health"):
		return

	collected = true
	body.restore_health(healing_amount)
	
	# Play the sound and hide the heart immediately, then wait for audio to finish before deleting
	audio_player.play()
	sprite.hide()
	set_deferred("monitoring", false)
	
	await audio_player.finished
	queue_free()
