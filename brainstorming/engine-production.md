# Engine & systems — production mindset

Brainstorming **how the simulation should behave** before we grow content: determinism, extensibility, failure modes, and what “robust” means for this codebase. Pair with `roadmap.md` for sequencing; **no task checklist here** — that comes after design lock.

## Design pillars (engineering)

1. **Single tick authority** — Movement, projectiles, enemy AI, cooldowns, and gate logic should have **clear ownership** (what runs on the timer vs what runs on discrete player actions). Mixed ownership caused real bugs (e.g. `all_enemies_dead` only in the loop while melee kills stopped the loop). Production rule: *any state change that can end combat must trigger the same “post-combat checks” as the tick.*
2. **Data-driven edges** — Rooms, doors, enemies, and pickups should be expressible from **templates + tables** without forking core logic for each room. Prefer declarative `gateCondition`, archetype ids, and shared validators over one-off `if (room.name === …)` in the engine.
3. **Invariant: door graph** — Every door cell in the layout must match `doorCellAt` for some `Door`; every `Door` must appear in `doorStates` after load. A small **dev-only assert** (or `:validate` command) is worth it before shipping larger campaigns.
4. **Determinism where it matters** — Seeds for proc floors, fixed ordering when opening multiple gates the same tick, and **documented** randomness (enemy `preRowMovesRemaining`, etc.) so reproducing player reports is possible.
5. **Fail loud in dev, degrade gracefully in prod** — Unknown commands, missing templates, or index out of range should never silently drop the player in a void.

## Entity model (where robustness bites)

| Layer | Responsibility | Production notes |
|-------|----------------|------------------|
| **Archetype** | Stats, glyph, AI kind | `ENEMY_ARCHETYPES` — add fields only when **all** AI paths respect them (e.g. resistances need projectile + melee + barrel damage to read them). |
| **Instance** | `id`, position, runtime timers | IDs must be unique per room; cloning on `loadLevel` must reset tick counters consistently. |
| **Room aggregate** | `enemies[]`, `barrels[]`, `projectiles[]`, `doorStates` | The engine should treat these as **snapshots** each tick: avoid mutating shared arrays without going through one reducer-style path where possible. |

**Future-friendly hooks** (brainstorm, not mandate):

- Status effects (slow, shield) as a small keyed map on the instance, processed in one `tickStatus(enemy)` pass.
- “Teams” or factions if summons/traps appear later.
- Scripted bosses as **finite state machines** with phases (data-defined transitions), not ad-hoc `if (hp < 3)` scattered in `tickEnemies`.

## Systems map (mental model)

- **Input** — Discrete actions: move, melee, fire, consume, chords. Some must call **shared outcome helpers** (open gates, apply damage, message rules).
- **Tick** — Continuous simulation when “something is live” (enemies, projectiles, light pulse). Define explicitly: *What counts as live?* HUD and pause modes should not desync `doorStates` from `room.doors`.
- **Render** — `buildFullGrid` is a pure function of state + room template; production goal is no “hidden” visual state outside the store.
- **Transitions** — `loadLevel`, `startDungeonRun`, `transitionDungeonByDoor` must reset the **same** bundle of fields (cooldowns, chords, pending keys) to prevent bleed-over.

## Content safety rails

- **Glyph registry** — Reserve single-char meanings (`| - _ #` doors/walls, `@` player, bracket pairs, puzzle letters). New room props should check collision with `isWalkable`, projectiles, light, and enemy pathing.
- **Balance surfaces** — Damage, HP, cooldown ticks, and stack sizes should be editable in **one file per category** (`weapons.ts`, `enemies.ts`, `items`) with room data referencing ids, not duplicating numbers.

## Testing & verification (before “production” claim)

- **Smoke paths** — Scripted checklist: tutorial 0→6→Act 1 both branches; `:warp` boundary indices; death + `:retry`.
- **Golden messages** — Optional: assert critical gates emit one canonical message (or none) to catch double-firing open logic.
- **Perf** — Current scale is tiny; if projectile count or room size grows, cap iterations and avoid O(n²) scans per cell without profiling hooks.

## Relationship to other brainstorm docs

- **`levels.md`** — What we *author*; engine promises to load it safely.
- **`monsters.md` / `weapons.md` / `items.md`** — What we *balance*; engine promises consistent application of stats.
- **`artistic-ideation.md`** — How it *reads*; engine promises color/glyph rules don’t fight clarity.

## When this doc “locks”

1. Agree on **tick vs input** split (paragraph in `README` or contributor guide).
2. List **invariants** worth a dev command or CI check.
3. Only then generate **implementation task lists** (separate from this brainstorm).

---

*Living doc: add concrete engine ADRs here when you change tick authority or entity shape.*
