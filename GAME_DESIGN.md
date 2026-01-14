# Game Design Document: The Chrono-Splinter

## Core Loop

```
[Fight Waves] → [Collect Coins & Power-ups] → [Defeat Boss] → [Upgrade Ship] → [Next Chapter]
```

---

## The Epoch: Player Ship

### Base Stats
| Stat | Description | Starting Value |
|------|-------------|----------------|
| **ATK** | Damage per shot | 10 |
| **DEF** | Damage reduction (%) | 0% |
| **SPD** | Movement speed | 5 |
| **FIRE RATE** | Shots per second | 3 |

### Upgrade System (Coins)

Coins are dropped by:
- **Drifters**: 1 coin
- **Stitchers**: 2 coins
- **Wraiths**: 3 coins
- **Harvesters**: 5 coins (slow, tanky, bonus drops)
- **Splitters**: 1 coin each (2 total)
- **Bosses**: 50-200 coins (scales with chapter)

**Upgrade Costs** (between chapters):
| Level | ATK Cost | DEF Cost | SPD Cost | Fire Rate Cost |
|-------|----------|----------|----------|----------------|
| 1→2   | 50       | 50       | 30       | 40             |
| 2→3   | 100      | 100      | 60       | 80             |
| 3→4   | 200      | 200      | 120      | 160            |
| 4→5   | 400      | 400      | 240      | 320            |
| 5→MAX | 800      | 800      | 480      | 640            |

---

## Power-Up System (Temporary & Permanent)

Power-ups drop from enemies and bosses. Some are **temporary** (timed), others are **permanent** (persist until death or chapter end).

### Temporary Power-Ups (15-30 seconds)
| Power-Up | Effect | Visual |
|----------|--------|--------|
| **Rapid Fire** | 2x fire rate | Blue glow |
| **Shield** | Absorbs 3 hits | Golden bubble |
| **Magnet** | Coins auto-collect | Purple aura |
| **Slow-Mo** | Enemies move at 50% speed | Screen tint |

### Weapon Power-Ups (Permanent until death)
These **change or add to** your weapon. You can hold **2 weapon mods** at once. Picking up a 3rd replaces the oldest.

| Weapon Mod | Effect | Visual |
|------------|--------|--------|
| **Spread Shot** | Fires 3 bullets in a cone | Triple barrel |
| **Piercing** | Bullets pass through enemies | Laser beam |
| **Homing** | Bullets track nearest enemy | Missiles |
| **Ricochet** | Bullets bounce off screen edges | Green tracer |
| **Charge Shot** | Hold to charge, release for massive damage | Glowing barrel |
| **Drone** | A small drone orbits you, firing automatically | Orbiting buddy |
| **Rear Gun** | Fires backward as well as forward | Tail turret |

### Combo Synergies
Some weapon mods combine for special effects:
- **Spread + Piercing** = Laser fan that sweeps through enemies
- **Homing + Drone** = Drone fires homing missiles
- **Charge + Piercing** = One-shot beam that clears a line

---

## Difficulty Scaling

Each chapter increases:
- Enemy health: +10% per chapter
- Enemy speed: +5% per chapter
- Enemy spawn rate: +5% per chapter
- Boss health: +15% per chapter

Player should be upgrading at roughly the same rate to keep pace.

---

## Lives & Continues

- **3 Lives** per chapter
- Losing all lives = **Game Over** (restart chapter)
- **Checkpoints** at mid-chapter and before boss
- Weapon mods reset on death, upgrades persist

---

## Scoring

| Action | Points |
|--------|--------|
| Drifter kill | 100 |
| Stitcher kill | 150 |
| Wraith kill | 200 |
| Harvester kill | 300 |
| Splitter kill | 50 each |
| Boss kill | 10,000 × chapter # |
| No-hit wave bonus | 500 |
| Speed clear bonus | 1,000 |

**High scores** saved per chapter and overall.

---

## UI Layout

```
┌─────────────────────────────────────────────┐
│ SCORE: 0000000    COINS: 000    CH: 01/12   │
├─────────────────────────────────────────────┤
│                                             │
│              [GAME AREA]                    │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ ♥♥♥   [WEAPON MOD 1] [WEAPON MOD 2]   ATK:10│
└─────────────────────────────────────────────┘
```
