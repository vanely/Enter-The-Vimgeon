# Levels & rooms

Brainstorming layouts, tutorials, puzzles, and how rooms connect into a run or overworld.

## Existing levels in the codebase

### Tutorial track (loaded in game)

These are exported from `src/data/rooms/tutorial.ts`, listed in order inside `tutorialLevels` (see ```495:503:src/data/rooms/tutorial.ts```). `loadLevel(n)` uses index `n` into that array.

Registration at startup: ```5:18:src/App.tsx``` (`tutorialLevels` → `initTutorialLevels`).

| Index | Export | `name` (in-game banner) | Codebase reference |
|-------|--------|-------------------------|--------------------|
| 0 | `tutorialLevel0` | Tutorial: Awakening | ```22:76:src/data/rooms/tutorial.ts``` |
| 1 | `tutorialLevel1` | Tutorial: The Locked Door | ```78:137:src/data/rooms/tutorial.ts``` |
| 2 | `tutorialLevel2` | Tutorial: Containers | ```139:220:src/data/rooms/tutorial.ts``` |
| 3 | `tutorialLevel3` | Tutorial: First Blood | ```222:289:src/data/rooms/tutorial.ts``` |
| 4 | `tutorialLevel4` | Tutorial: Dodge & Cover | ```291:366:src/data/rooms/tutorial.ts``` |
| 5 | `tutorialComplete` | Tutorial Complete! | ```368:430:src/data/rooms/tutorial.ts``` |
| 6 | `tutorialLevelHelp` | Tutorial: The Help Scroll | ```432:493:src/data/rooms/tutorial.ts``` |

Shared helpers in the same file: `ROOM_W`, `ROOM_H`, `makeLayout`, `padLine` (see top of `tutorial.ts`).

### Puzzle rooms (not in tutorial loader)

**File:** `src/data/rooms/puzzles.ts`  
**Wiring:** These exports are **not** registered in `src/App.tsx` today (only `tutorialLevels` → `initTutorialLevels`). Add a story loader or merge into `tutorialLevels` when you hook narrative.

#### Index

| Export | `name` | Source |
|--------|--------|--------|
| `puzzlePrismaticVault` | Puzzle: Prismatic Vault | ```11:80:src/data/rooms/puzzles.ts``` |
| `puzzleLevels` | *(ordered list)* | ```82:85:src/data/rooms/puzzles.ts``` |

#### `puzzlePrismaticVault`

- **Puzzle:** `lightPuzzle` — beam from `S`, bounces on `/` and `\`, `'` as light-only slit, hit `R` to satisfy `gateCondition: 'light_puzzle'` on the **north** door.
- **Loot:** `fire_wand` floor pickup (see `keys` in source).
- **South exit:** `gateCondition: 'reach'`, `targetLevel: 5`. That index only matches **“Tutorial Complete!”** if this room lives in the **same** array as `tutorialLevels`; as a standalone puzzle track, retarget or replace when wiring.

#### `puzzleLevels`

- Currently: `[ puzzlePrismaticVault ]`.
- Placeholder for more puzzle rooms in the same file before a dedicated loader exists.

Loader hooks (tutorial + any future puzzle list): `src/engine/gameState.ts` — list storage ```271:283:src/engine/gameState.ts```; `loadLevel` ```494:572:src/engine/gameState.ts```.

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
- **Tutorial:** `tutorialLevels` + `initTutorialLevels` in `src/App.tsx` (see table above).
- **Puzzles:** see **Puzzle rooms** above; `puzzleLevels` is export-only until a loader merges or replaces the tutorial list.

## Tie-ins

- See `monsters.md` for who populates each room.
- See `items.md` / `weapons.md` for pickups placed in layout.
- See `story.md` for narrative order of locations.
