# Roadmap — where we go from here

Brainstorming next directions now that the **tutorial track**, **core combat loop**, **inventory / equip**, **containers & pickups**, **`:help`**, and a **stub puzzle room** exist. Nothing here is committed scope; it is a menu of plausible paths.

## Where we are (anchor)

- **Player fantasy:** grid movement, Vim-ish modes (NORMAL / INSERT / VISUAL / COMMAND), melee `x`, ranged `d`, consumables `gg`, dodge `%` + rolls, barrels, doors, signs, message log.
- **Content:** seven tutorial rooms + one light-puzzle vault defined but not on the main loader (`levels.md`).
- **Gaps:** no persistent “dungeon run” after tutorial; help sections beyond controls/combat/items are thin; no save/meta-progress; story is a blank (`story.md`).

## Strategic forks (pick one primary spine)

These are not mutually exclusive long-term, but **ordering** matters for momentum.

1. **“Graduate from tutorial” spine**  
   First playable “real” segment after the help room: a short **Act 1** (5–15 rooms) with a boss or exit, reusing existing gates (`reach`, `command_open`, `all_enemies_dead`, `light_puzzle`, `help_then_reach`). Lowest risk: mostly data (`levels.md`, `monsters.md`, `items.md`, `weapons.md`).

2. **“Puzzle layer” spine**  
   Wire `puzzleLevels` (or a `storyLevels` array) into a **second mode** or chapter select so Prismatic Vault is reachable without hacks. Good if you want the brand to feel like **text puzzles + combat**, not only shooting goblins.

3. **“Vim depth” spine**  
   Add a small number of **high-signal** motions (e.g. word objects, marks, one command-mode action) each tied to **one** mechanic with a dedicated room. Risk: scope creep and tutorial debt unless each addition has a **single** teaching room.

4. **“Roguelike / replay” spine**  
   Procedural or shuffled rooms, death = run end, unlocks. Heavier engineering (generation, balance, UI). Better **after** one hand-authored Act proves fun.

**Suggestion:** (1) + a thin slice of (2): **one** post-tutorial branch that includes the vault as an optional side path, so puzzle and combat both feel “in the game.”

## Concrete next moves (short term)

| Idea | Why now | Touches |
|------|---------|---------|
| **Level loader abstraction** | Tutorial is a single array; post-tutorial needs chapters or `type: 'tutorial' \| 'dungeon'`. | `App.tsx`, `gameState.ts`, new `data/rooms/*.ts` |
| **Story beat after index 6** | Player hits a wall today; give a door to “Chapter 1” or a hub sign. | `tutorial.ts` or new file + `story.md` |
| **Wire Prismatic Vault** | Already built; validates light puzzle in production. | `puzzles.ts`, loader, fix `targetLevel` / door graph (`levels.md`) |
| **Enemy + item pass for Act 1** | Reuse AI patterns; add 2–3 new monsters and 3–5 pickups for variety. | `monsters.md`, `items.md`, `enemies.ts`, `items.ts` |
| **Help: one real stub → useful** | Map / spells / bestiary: either one paragraph of truth or hide until implemented. | `src/data/help/controls.ts` |
| **Playtest friction** | Restart to level N, god mode, or dev `:warp n` if you iterate rooms often. | `executeCommand` or dev-only |

## Medium term (once Act 1 is fun once)

- **Persistence:** save slot or run summary (even localStorage) so iteration is not “always from zero.”
- **Audio / juice:** hitstop, projectile SFX, door sound — optional but raises perceived quality.
- **Boss pattern:** one multi-phase enemy teaching a **single** new rule (e.g. only vulnerable after light puzzle).

## Cross-links (other brainstorm files)

- **`story.md`** — why the dungeon exists and why Act 1 matters (names the exit condition).
- **`levels.md`** — room list and wiring truth; new rooms land here as references.
- **`monsters.md` / `weapons.md` / `items.md`** — content backlog for Act 1 without bloating the engine in one PR.

## Open questions (decide when you pick a spine)

- Is the fantasy **“learn Vim through a game”** or **“a roguelike that uses Vim keys”**? Ratio drives how strict motions are vs readable game verbs.
- Should **INSERT** ever do more than move + `:` (e.g. type on signs), or stay minimal?
- One **canonical win state** for v1: escape the first floor? Defeat a named villain? “Finish tutorial” is already done — what replaces it emotionally?

## Anti-goals (guardrails)

- Avoid adding three systems at once (e.g. crafting + shops + proc gen) before **one** post-tutorial arc is winnable start-to-finish.
- Avoid duplicating “two ways to do the same job” without a clear fantasy (registers vs equip was a good cut).

---

*Revise this doc as soon as you pick a spine; the table of “concrete next moves” should stay honest to what is actually next.*
