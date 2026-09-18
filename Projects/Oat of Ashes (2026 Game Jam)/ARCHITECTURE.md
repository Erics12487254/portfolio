# Architecture

## Overview

This is a Godot 4.7 top-down wave-survival prototype. `res://scenes/map/camelot.tscn` is the configured main scene. Its root (`Camelot`) owns the map layers and runs `wave_manager.gd`; it instantiates the player, enemies, and spawn effects at runtime.

```text
Camelot (wave_manager.gd)
├── TileMapLayer: water, waterfoam, ground, shadow, cliff, props
├── Node2D: enemies       <- runtime Enemy instances
├── Node2D: effects       <- runtime Spawn and Death effect instances
└── runtime Player child  <- added directly to Camelot
```

Input actions `up`, `down`, `left`, and `right` are defined in `project.godot` (WASD and arrow keys). Physics layer 1 is `environment`, layer 5 is `enemy_damage`, and layer 6 is `player_damage`.

## Scene and Script Dependencies

| Owner | Script / resource | Dependency and role |
| --- | --- | --- |
| `camelot.tscn` | `map/wave_manager.gd` | Main-scene controller. Uses child nodes `ground`, `enemies`, and `effects`; instantiates the configured player, enemy, and spawn-effect scenes. |
| `player.tscn` | `entities/player/player.gd` | Player movement, mouse-directed attack, health, damage handling, and death effect creation. Uses its `Sprite2D`, `AnimationTree`, and `hitbox` children. |
| `enemy.tscn` | `entities/enemies/enemy.gd` | Enemy chase/attack AI, health, damage feedback, and death effect creation. Uses `Sprite2D` and `AnimationTree`. |
| `spawn.tscn` | `effects/spawn.gd` | Scales and fades itself, then frees itself through a tween callback. |
| `death.tscn` | `effects/death.gd` | Starts the `Death` animation and frees itself when the animation ends. |

Both player and enemy scenes depend on `death.tscn`. Player and enemy sprites, plus map tiles, are external assets under `res://Tiny Swords/...`.

## Inspector Export Connections

### `Camelot` / `wave_manager.gd`

The root of `camelot.tscn` assigns these exported scene resources:

| Export | Inspector connection | Purpose |
| --- | --- | --- |
| `player_scene` | `res://scenes/entities/player/player.tscn` | Instantiated once in `_spawn_player()` and parented directly under `Camelot`. |
| `enemy_scene` | `res://scenes/entities/enemies/enemy.tscn` | Instantiated per enemy in `_spawn_enemy()` and parented under `enemies`. |
| `spawn_effect_scene` | `res://scenes/effects/spawn.tscn` | Instantiated at player/enemy spawn positions and parented under `effects`. |
| `total_waves` | Script default: `10` | Number of sequential waves. |
| `minimum_enemies_per_wave` | Script default: `2` | Lower random bound before wave scaling. |
| `maximum_enemies_per_wave` | Script default: `5` | Upper random bound before wave scaling. |
| `player_spawn_position` | Script default: `(242, 232)` | Preferred player spawn; falls back to a random valid ground tile. |
| `enemy_spawn_bounds` | Script default: `Rect2(100, 100, 900, 520)` | Candidate area for enemy spawning; enemies must also be at least 220 px from the player. |

`ground` must remain a direct child named exactly `ground`: spawn validation converts world positions through it and accepts cells with a source ID other than `-1`. Likewise, `enemies` and `effects` are required direct-child containers with these exact lowercase names.

### Player / `player.gd`

| Export | Inspector connection | Purpose |
| --- | --- | --- |
| `hitpoints` | Default `200` | Initial and maximum runtime health-bar value. |
| `speed` | Default `400` | Movement speed. |
| `attack_speed` | Default `0.6` | Attack-state duration. |
| `attack_damage` | Default `60` | Damage passed to a hurt target's `take_damage`. |
| `damage_invulnerability_time` | Default `0.35` | Post-hit immunity duration. |
| `death_packed` | `res://scenes/effects/death.tscn` | Death effect instantiated at the player position. |

Required named children are `Sprite2D`, `AnimationTree`, and `hitbox`. `AnimationTree` points to `AnimationPlayer`. The player body is on layer 2 and collides with layer 1 (`environment`); `hitbox` detects layer 5 (`enemy_damage`) and is initially disabled. `Camera2D` is a player child with zoom `(0.8, 0.8)`.

### Enemy / `enemy.gd`

| Export | Inspector connection | Purpose |
| --- | --- | --- |
| `hitpoints` | Default `180` | Initial and maximum runtime health-bar value. |
| `move_speed` | Default `140.0` | Chase speed. |
| `detection_radius` | Default `260.0` | Maximum distance to begin chasing. |
| `attack_range` | Default `78.0` | Range checked before and after attack wind-up. |
| `attack_damage` | Default `25` | Damage passed to the player. |
| `attack_windup` | Default `0.25` | Delay before damage is applied. |
| `attack_cooldown` | Default `0.8` | Full attack cycle duration. |
| `death_packed` | `res://scenes/effects/death.tscn` | Death effect instantiated at the enemy position. |

Required named children are `Sprite2D` and `AnimationTree`; `AnimationTree` points to `AnimationPlayer`. The enemy body is on layer 3 and collides with layer 1. Its `Hurtbox` is an `Area2D` on layer 5 (`enemy_damage`), which is detected by the player hitbox.

## Groups

| Group | Membership | Consumers | Contract |
| --- | --- | --- | --- |
| `player` | Added by `player.gd` in `_ready()`; removed just before player death is freed. | `enemy.gd`, `wave_manager.gd` | Represents the current target and the position enemies must avoid at spawn. The design assumes at most one member. |
| `enemies` | Added by `enemy.gd` in `_ready()`; disappears automatically when an enemy is freed. | `wave_manager.gd` | Tracks living enemies. A wave ends only when this group is empty. |

## Signal and Event Flows

### Player attack and enemy death

```text
Left mouse press
  -> player._unhandled_input()
  -> player.attack(): chooses cardinal aim; updates AnimationTree and hitbox transform
  -> attack animation enables hitbox.monitoring during impact frames
  -> hitbox.area_entered (serialized scene connection)
  -> player._on_hitbox_area_entered(area)
  -> area parent (enemy) .take_damage(attack_damage)
  -> enemy.death(): spawn Death effect under Camelot/effects; queue_free()
  -> enemy leaves `enemies` group
  -> wave manager's polling loop advances when no enemies remain
```

The player attack animation owns the impact window: each directional attack animation serializes tracks for `hitbox:monitoring`. Script code disables monitoring at attack start, attack completion, and player death.

### Enemy AI and player damage

```text
enemy._physics_process()
  -> lookup first `player` group member
  -> chase while within detection radius
  -> attack after wind-up when within attack range
  -> player.take_damage(attack_damage)
  -> player health/UI update, temporary invulnerability, or death
  -> player death effect + queue_free() + removal from `player` group
```

Enemies do not use a Godot signal for their damage; they call `take_damage` after verifying the target method exists. If no player group member exists, enemies stop and idle.

### Spawning and effect lifetime

```text
Camelot._ready() -> randomize() -> spawn player -> run waves
run waves -> spawn enemies -> wait until `enemies` is empty -> 1 second delay -> next wave
spawn player/enemy -> spawn Spawn effect under `effects`
Spawn._ready() -> tween scale/alpha -> queue_free()
Death._ready() -> AnimationPlayer.play("Death")
AnimationPlayer.animation_finished (serialized scene connection)
  -> death._on_animation_player_animation_finished() -> queue_free()
```

## Serialized Signal Connections

| Scene | Signal source | Signal | Target method | Effect |
| --- | --- | --- | --- | --- |
| `player.tscn` | `hitbox` (`Area2D`) | `area_entered` | `player._on_hitbox_area_entered(area)` | Applies player attack damage to the collided area's parent when it implements `take_damage`. |
| `death.tscn` | `AnimationPlayer` | `animation_finished` | `Death._on_animation_player_animation_finished(anim_name)` | Frees the completed death-effect instance. |

No custom signals or runtime `.connect()` calls are present in the scanned scripts.

## Maintenance Constraints

- Preserve exact node names used through `$NodeName` and `get_node_or_null`: `ground`, `enemies`, `effects`, `Sprite2D`, `AnimationTree`, `AnimationPlayer`, `hitbox`, and `Hurtbox`.
- Preserve the collision contract: player `hitbox` mask 16 must see enemy `Hurtbox` layer 16. Map collision is layer 1 for both bodies.
- The wave manager uses a group-empty polling loop (0.4 s), not an enemy-death signal. Any replacement enemy must join `enemies` and free itself on death.
- Death effects expect an `effects` child on the current scene; they fall back to the dead entity's parent if it is absent.
