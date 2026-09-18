class_name EnemyArrow
extends Node2D

@export var speed := 420.0
@export var damage := 8

var direction := Vector2.LEFT
var lifetime := 2.0

func setup(shot_direction: Vector2, shot_damage: int) -> void:
	direction = shot_direction.normalized()
	damage = shot_damage
	rotation = direction.angle()

func _physics_process(delta: float) -> void:
	global_position += direction * speed * delta
	lifetime -= delta
	var player := get_tree().get_first_node_in_group("player") as Node2D
	if player != null and global_position.distance_to(player.global_position) < 28.0:
		if player.has_method("take_damage"):
			player.call("take_damage", damage)
		queue_free()
	elif lifetime <= 0.0:
		queue_free()
