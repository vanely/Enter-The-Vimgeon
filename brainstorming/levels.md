# Levels & rooms

Brainstorming layouts, **linear progression**, tutorials, puzzles, and how rooms connect into a run. **Design here first**; index tables below stay the implementation truth (`levels.md` ↔ code).

## Design goals (game dev lens)

1. **Teach → prove → escalate** — Each chapter introduces **one** new verb or hazard, then the next room assumes it without a sign wall of text.
2. **Readable stakes** — Player always knows *why* they’re moving (door visible, boss silhouette, pickup “!” on path). Avoid maze-for-maze-sake in the main line.
3. **Branching is opt-in hard** — Side rooms (vault, treasure) reward aptitude; main line stays completable with baseline gear (`weapons.md` / `items.md` must state baseline).
4. **Room grammar** — Reuse **lego pieces**: hollow box + perimeter door API, bracket lanes, barrel pairs, light-puzzle kit. New mechanics get a named template before bespoke art pass.

## Linear progression (authored campaign)

**Principle:** The player should *feel* difficulty and kit ramp even when indices are just numbers.

| Leg | Indices (current) | Beat | Escalation knob |
|-----|-------------------|------|-----------------|
| **Boot** | 0–5 | Tutorial teaches verbs | One new rule per room; no optional branches |
| **Gate** | 6 | `:help` as soft gate | Teaches meta-ui before “real” danger |
| **Threshold** | 7 | First “real” fight | Same verbs, less scaffolding; tighten HP budget |
| **Choice** | 8–9 optional | Fork + vault | Puzzle literacy OR skip |
| **Pressure** | 10+ (extend in brainstorm) | Main shaft **sequence** | Add room count, pair enemy archetypes, reduce safe tiles |
| **Boss / release** | Terminus (11) → proc | Emotional payoff | Sign names descent; proc = “infinite practice” |

**Backlog — expand main shaft** (brainstorm before `act1.ts`):

- `act1ShaftA` — Cover + **one** ranged nuisance (reuse slime/imp patterns).
- `act1ShaftB` — Barrel **required** or highly rewarded (different shape than tutorial 4).
- `act1ShaftC` — Mixed pack or “introduce new archetype” from `monsters.md` (only after row exists there).

## Room types (extended vocabulary)

| Type | Purpose | Typical kit | Failure mode if overused |
|------|---------|-------------|---------------------------|
| **Tutorial** | Zero-fail teach | Signs, single enemy or none | Too much text |
| **Combat** | Stamina + aim | Cover, brackets, mixed AI | Same layout twice |
| **Puzzle** | Cognitive loop | Keys, beam, containers | Off main line without signpost |
| **Set-piece** | Memory moment | Unique silhouette, boss rule | Engine one-offs without spec |
| **Breather** | Loot / lore | Containers, short sign | Player boredom if no reward |

## Campaign vs procedural

- **Authored** — Guarantees **curriculum** and story beats (`story.md`).
- **Procedural** — Spiky difficulty; use for **extension** after terminus, not to replace Act teaching. Dungeon exit table in `dungeonRooms.ts` should eventually mirror **exit types** brainstormed here (combat / treasure / arena).

## Existing levels in the codebase

### Tutorial track (loaded in game)

These are exported from `src/data/rooms/tutorial.ts`, listed in order inside `tutorialLevels`. `loadLevel(n)` uses index `n` into the **full** campaign array.

Shared helpers: **`ROOM_W` (128)**, **`ROOM_H` (30)**, `makeLayout`, `hollowRoom`, `PerimeterDoor`, etc. (see `tutorial.ts`).

Registration at startup: `App.tsx` — `initTutorialLevels([...tutorialLevels, ...act1Levels])`.

| Index | Export | `name` (in-game banner) | Codebase reference |
|-------|--------|-------------------------|--------------------|
| 0 | `tutorialLevel0` | Tutorial: Awakening | `tutorial.ts` |
| 1 | `tutorialLevel1` | Tutorial: The Locked Door | `tutorial.ts` |
| 2 | `tutorialLevel2` | Tutorial: Containers | `tutorial.ts` |
| 3 | `tutorialLevel3` | Tutorial: First Blood | `tutorial.ts` |
| 4 | `tutorialLevel4` | Tutorial: Dodge & Cover | `tutorial.ts` |
| 5 | `tutorialComplete` | Tutorial Complete! | `tutorial.ts` |
| 6 | `tutorialLevelHelp` | Tutorial: The Help Scroll | `tutorial.ts` |

### Act 1 & vault (indices 7–11)

**File:** `src/data/rooms/act1.ts` — `act1Levels` merged after tutorial. Constants: `ACT1_INDEX`.

| Index | Export | `name` | Notes |
|-------|--------|--------|--------|
| 7 | `act1Threshold` | Act 1: The Threshold | South → fork |
| 8 | `act1Fork` | Act 1: Fork in the Shaft | East → vault, south → main shaft |
| 9 | `puzzlePrismaticVault` | Puzzle: Prismatic Vault | `puzzles.ts`; south → **10** |
| 10 | `act1MainShaft` | Act 1: Main Shaft | **Extend** per progression table above |
| 11 | `act1Terminus` | Act 1: Descent | → `startDungeonRun` |

**Dev:** `:warp <n>` jumps to campaign index.

### Puzzle rooms (`puzzles.ts`)

`puzzlePrismaticVault` — light puzzle; loot `fire_wand`. Keep `targetLevel` aligned with `ACT1_INDEX.mainShaft`.

## Level flow — decisions to lock

- **Hub vs linear:** Act 1 is **linear with one side branch**; future acts might use a **lobby room** with numbered doors (still data-driven).
- **Backtrack:** Generally avoid softlocks; vault return rejoins main index (pattern established).

## Room / level ideas backlog

| Working name | Goal | Key mechanics | Layout notes |
|--------------|------|---------------|--------------|
| `act1ShaftA` | Pressure after fork | Brackets + imp | Narrow middle row |
| `act1ShaftB` | Barrel payback | Explosion risk | Two barrel anchors |
| `act1Cache` | Optional consumables | `:inv` literacy | Off main path 1 room |
| `tutorialRecap` | (optional) Speedrun room | Combo gate | Defer until motions stable |

## Implementation pointers

- `RoomTemplate` in `src/engine/types.ts`.
- **Brainstorm → task list:** When adding rooms, update this table + `story.md` beat + `monsters.md` encounter row in the same design pass.

## Tie-ins

- `engine-production.md` — door graph invariants, tick vs input.
- `monsters.md` — who lives in each new beat.
- `items.md` / `weapons.md` — what the room places on the floor.
- `story.md` — why the player passes through.

---

*Living doc: progression table drives content PRs once rows are filled and reviewed.*
