# Monsters

Brainstorming enemy **archetypes**, AI families, and encounters. Combat verbs today: **melee `x`**, **ranged `d`** (equipped weapon), **dodge context** (brackets, spacing), **barrels**, **enemy projectiles** from `chase_shoot` patterns.

**Implementation truth:** `ENEMY_ARCHETYPES` in `src/data/enemies.ts`; rooms spawn with `createEnemy(archetypeId, instanceId, pos)`. **New enemy = new row here + types** before art pass on glyphs.

---

## Principles (what makes a good fight here)

1. **Readability first** — Player predicts intent from position + animation ticks; new AI needs a **one-line player read** (“it stops to shoot”).
2. **Teach the grid** — Enemies justify **cover**, **kiting**, **line of fire**; avoid pure stat walls on small rooms.
3. **Composable packs** — Prefer pairs (grunt + shooter) over bespoke boss logic until boss pipeline exists.
4. **Fair telegraph** — `shootCooldown` / `moveSpeed` are the tempo knobs; document intended **safe tiles** per encounter in `levels.md`.

---

## AI families (extend as code supports)

| `EnemyAI` (current) | Behavior sketch | Counterplay | Watch-outs |
|---------------------|-----------------|-------------|------------|
| `chase` | Path toward player on move ticks | Corners, brackets, barrel denial | Body-blocking allies if we add them |
| `chase_shoot` | Chase + halt cadence to shoot | Break LOS, strafe after shot | Fast CD + fast move = unfair in open rooms |

**Future families (design only until spec’d):** `patrol`, `flee`, `stationary_turret`, `summoner` — each needs tick budget + glyph rules.

---

## Current archetypes (code)

| Id | Name | Chars | HP | Dmg | `shootCooldown` | `moveSpeed` | Role |
|----|------|-------|-----|-----|-----------------|-------------|------|
| `goblin_grunt` | Goblin Grunt | `g` | 3 | 1 | 0 | 4 | Melee baseline |
| `slime` | Slime | `s` | 2 | 1 | 6 | 6 | Ranged nuisance, slow |
| `dart_imp` | Dart Imp | `i` | 2 | 1 | 4 | 5 | Faster shooter |

---

## Ideas backlog (not in code until spec’d)

| Name / sketch | Archetype id sketch | AI pattern | Notes |
|---------------|---------------------|------------|-------|
| Rubble turret | `debris_turret` | `stationary_turret` (future) | Teaches breaking LOS without chase |
| Cave bat | `bat` | `chase`, fast move, low HP | Noise glyph must not collide with imp |

---

## Encounters & pacing

| Band | Levels (see `levels.md`) | Typical pack | Intent |
|------|--------------------------|--------------|--------|
| Tutorial | 0–5 | `goblin_grunt` alone or pairs | Teach `x`, cover, containers |
| Post-help / Act 1 threshold | 7+ | grunt + shooter mix | Prove literacy |
| Vault | Puzzle room | none or ambient only | Keep puzzle pure unless design says otherwise |
| Procedural | Depth-scaled | Table TBD | Spawn rules live here before `dungeon.ts` tuning |

---

## Production checklist (per new archetype)

1. **Glyph** reserved in Tier-1 band; no collision with projectiles (`artistic-ideation.md`).
2. **TTK** samples with **baseline** and **speedrun** loadouts from `weapons.md`.
3. **Bestiary** string — `encounteredEnemies` relies on archetype id stability.
4. **Playtest** two room sizes: narrow (20-wide inner) and wide (40+).

---

## Tie-ins

- `story.md` — diegetic name vs internal id (internal id never changes post-ship if saves exist).
- `levels.md` — which encounter proves which lesson.
- `engine-production.md` — tick order vs player input; determinism for replays.

---

*Living doc: editing archetype stats requires a row in this file and a short playtest note.*
