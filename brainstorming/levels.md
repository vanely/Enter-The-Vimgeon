# Levels & rooms

Brainstorming layouts, tutorials, puzzles, and how rooms connect into a run or overworld.

## Existing levels in the codebase

### Tutorial track (loaded in game)

These are exported from `src/data/rooms/tutorial.ts`, listed in order inside `tutorialLevels` (see ```526:534:src/data/rooms/tutorial.ts```). `loadLevel(n)` uses index `n` into that array.

Shared helpers: `ROOM_W` (80), `ROOM_H` (30), `ROOM_PAD_*`, `makeLayout`, `expandLegacyLayoutRows`, `padLine` (see top of `tutorial.ts`).

Registration at startup: ```20:20:src/App.tsx``` — `initTutorialLevels([...tutorialLevels, ...act1Levels])` (see `src/data/rooms/act1.ts`).

| Index | Export | `name` (in-game banner) | Codebase reference |
|-------|--------|-------------------------|--------------------|
| 0 | `tutorialLevel0` | Tutorial: Awakening | ```53:107:src/data/rooms/tutorial.ts``` |
| 1 | `tutorialLevel1` | Tutorial: The Locked Door | ```109:168:src/data/rooms/tutorial.ts``` |
| 2 | `tutorialLevel2` | Tutorial: Containers | ```170:251:src/data/rooms/tutorial.ts``` |
| 3 | `tutorialLevel3` | Tutorial: First Blood | ```253:320:src/data/rooms/tutorial.ts``` |
| 4 | `tutorialLevel4` | Tutorial: Dodge & Cover | ```322:397:src/data/rooms/tutorial.ts``` |
| 5 | `tutorialComplete` | Tutorial Complete! | ```399:461:src/data/rooms/tutorial.ts``` |
| 6 | `tutorialLevelHelp` | Tutorial: The Help Scroll | ```495:539:src/data/rooms/tutorial.ts``` |

### Act 1 & vault (same loader, indices 7–11)

**File:** `src/data/rooms/act1.ts` — `act1Levels` merged after the tutorial in `App.tsx`. Constants: `ACT1_INDEX`.

| Index | Export | `name` | Notes |
|-------|--------|--------|--------|
| 7 | `act1Threshold` | Act 1: The Threshold | One goblin; south → 8 |
| 8 | `act1Fork` | Act 1: Fork in the Shaft | East → 9 (vault), south → 10 (main) |
| 9 | `puzzlePrismaticVault` | Puzzle: Prismatic Vault | From `puzzles.ts`; south → **10** (rejoin main) |
| 10 | `act1MainShaft` | Act 1: Main Shaft | Slime + dart imp; south → 11 |
| 11 | `act1Terminus` | Act 1: Descent | South door → `startDungeonRun` (procedural dungeon) |

**Dev:** `:warp <n>` in command mode jumps to campaign index `n` (0–11).

### Puzzle rooms (`puzzles.ts`)

**File:** `src/data/rooms/puzzles.ts`  
**Wiring:** `puzzlePrismaticVault` is **also** re-exported via `act1Levels` (campaign index **9**). Other puzzle stubs can stay in `puzzleLevels` until merged.

#### Index

| Export | `name` | Source |
|--------|--------|--------|
| `puzzlePrismaticVault` | Puzzle: Prismatic Vault | ```47:99:src/data/rooms/puzzles.ts``` |
| `puzzleLevels` | *(ordered list)* | ```102:104:src/data/rooms/puzzles.ts``` |

#### `puzzlePrismaticVault`

- **Puzzle:** `lightPuzzle` — beam from `S`, bounces on `/` and `\`, `'` as light-only slit, hit `R` to satisfy `gateCondition: 'light_puzzle'` on the **north** door.
- **Loot:** `fire_wand` floor pickup (see `keys` in source).
- **South exit:** `gateCondition: 'reach'`, `targetLevel: 10` — **Act 1: Main Shaft** in the merged campaign (`act1.ts`). Keep aligned with `ACT1_INDEX.mainShaft`.

#### `puzzleLevels`

- Currently: `[ puzzlePrismaticVault ]`.
- Placeholder for more puzzle rooms in the same file before a dedicated loader exists.

Loader hooks: `src/engine/gameState.ts` — `_tutorialLevels` holds the **full campaign** (tutorial + Act 1); `loadLevel(n)` indexes into it. `initTutorialLevels` name is historical.

## Room types

- **Tutorial** — `src/data/rooms/tutorial.ts` today; extend or replace acts here.
- **Combat** — choke points, cover, bracket dodge setups.
- **Puzzle** — keys, light beams, containers, signs.
- **Set-piece** — boss rooms, escape sequences, NPC tiles (future).

## Level flow

- *(Linear chapters? Hub? Roguelike floors?)*

## Room / level ideas backlog

| Working name | Goal | Key mechanics | Layout notes |
|----------------|------|---------------|----------------|
| | | | |

## Implementation pointers

- Room templates: `RoomTemplate` in `src/engine/types.ts`.
- **Puzzle:** see `puzzles.ts` + campaign index 9 above.
- **Tutorial:** `tutorialLevels` in `src/data/rooms/tutorial.ts`.
- **Act 1:** `act1Levels` in `src/data/rooms/act1.ts` — merged in `App.tsx`.

## Tie-ins

- See `monsters.md` for who populates each room.
- See `items.md` / `weapons.md` for pickups placed in layout.
- See `story.md` for narrative order of locations.
