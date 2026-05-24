# Roadmap — where we go from here

Brainstorming **direction and sequencing**. **`brainstorming/*` docs are the design front** — we deepen those *before* large code changes; **task lists per doc** come after each brainstorm “locks” (see `engine-production.md` for engineering criteria).

## Where we are (anchor) — refresh

- **Player fantasy:** grid movement, Vim-ish modes (NORMAL / INSERT / VISUAL / COMMAND), melee `x`, ranged `d`, consumables `gg` / quick slots, dodge `%` + rolls, barrels, doors, signs, message log, minimap in dungeon.
- **Content:** **tutorial 0–6** + **Act 1 (7–11)** merged in one campaign array; **optional Prismatic Vault** on the branch; **procedural dungeon** after Act 1 terminus. See `levels.md` for indices.
- **Gaps:** story still thin (`story.md`); help sections partly stubby; **no** persistent save/meta-run; Act 1 **content depth** (more rooms, polish tickets in `act1-vault-branch-tickets.md`) not finished; **engine hardening** documented intent in `engine-production.md`, not a checklist yet.

## Strategic forks (still valid — pick emphasis, not exclusivity)

1. **“Graduate from tutorial” spine** — Hand-authored beats after the help room; **in progress** via Act 1; extend with more shaft rooms and tuning (`levels.md`, content docs).
2. **“Puzzle layer” spine** — Thin slice **shipped** (vault branch); can add more puzzle rooms *after* beam/light rules are treated as first-class in engine docs.
3. **“Vim depth” spine** — High-signal motions tied 1:1 to mechanics; high tutorial debt — sequence **after** Act 1 + one boss feel fun.
4. **“Roguelike / replay” spine** — Procedural grid exists; **meta-progress / run identity** later. Needs save/run summary (`engine-production.md` + roadmap medium term).

**Active suggestion:** Keep **(1) + optional (2)** as the default spine while **engine-production.md** invariants prevent content-scale bugs.

## Phased brain → build (recommended)

| Phase | Brainstorm focus (docs) | Build unlock |
|-------|-------------------------|--------------|
| **A — Lock language** | `artistic-ideation.md` (ASCII rules, palette, motion); `story.md` one-paragraph premise + Act 1 tone | Art tokens, sign voice, glyph registry |
| **B — Lock progression** | `levels.md` (linear beat chart + chapter template); `roadmap.md` milestone | Room authoring pipeline, fewer graph mistakes |
| **C — Lock catalog** | `items.md`, `weapons.md`, `monsters.md` **filled tables** + tie-ins | Data-only PRs without engine rewrites |
| **D — Lock simulation** | `engine-production.md` tick/input split, invariants, tests idea | Refactors + dev tooling with confidence |

Work can overlap lightly, but **avoid coding large new systems** until **C** has at least draft rows for anything that needs new fields on `Enemy` / `Weapon` / `RoomTemplate`.

## Concrete next moves (short term) — design-first

| Idea | Doc to extend first | Why |
|------|----------------------|-----|
| **Act 1 depth** | `levels.md` + `monsters.md` | More shaft rooms and encounter recipes before touching `act1.ts` again. |
| **Vim-flavored loot** | `items.md` + `weapons.md` | Name + fantasy + balance columns filled; then map to existing `equip` / `gg` / `d` verbs. |
| **Readable ASCII** | `artistic-ideation.md` | Boss glyph policy, hazard vocabulary, animation caps. |
| **Narrative glue** | `story.md` | One paragraph premise + Act table so signs and room names stop drifting. |
| **Engine contract** | `engine-production.md` | Turn “we should” into invariant list; *then* task list for refactors. |

*Retire rows from the old “touches `App.tsx`” table when superseded — implementation detail belongs in task trackers after brainstorm lock.*

## Medium term (unchanged directionally)

- **Persistence** — Run summary or save slot; defines what “Act 2” means for replay.
- **Juice** — SFX, hitstop; must respect ASCII readability rules in `artistic-ideation.md`.
- **Boss** — One pattern monster with **one** new rule; design in `monsters.md` + room set-piece in `levels.md`.

## Cross-links

| Doc | Role |
|-----|------|
| `engine-production.md` | Simulation robustness, entities, tick authority |
| `levels.md` | Geography, progression, room grammar |
| `story.md` | Premise, acts, emotional payoff |
| `artistic-ideation.md` | Look, ASCII discipline, tone |
| `items.md` / `weapons.md` / `monsters.md` | Catalog + balance + Vim flavor |
| `act1-vault-branch-tickets.md` | **Execution** backlog for current branch (separate from pure brainstorm) |

## Open questions

- **Player promise:** “Learn Vim” vs “Roguelike with Vim keys” — ratio sets strictness of future motions (`story.md` + `roadmap` should answer once).
- **INSERT scope** — Stay minimal until Act 1 ships fun combat loop.
- **v1 win state** — Name it in `story.md` so `levels.md` terminus always telegraphs the same goal.

## Anti-goals

- No mega-features (crafting + shops + full proc narrative) before **one** post-tutorial path feels **complete and fair** twice through playtest.
- No *orphan brainstorm*: if it’s not in a doc here, it shouldn’t drive a PR.

---

*Revise this file when Phase A–D advance; keep “where we are” honest.*
