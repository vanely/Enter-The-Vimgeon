# Act 1 + optional Prismatic Vault — ideation & ticket backlog

**Intent:** Ship **one** post-tutorial experience that implements the roadmap suggestion: **spine (1) “graduate from tutorial”** plus a **thin slice of spine (2)** so a **light-puzzle vault** is a real, optional branch—not a orphaned `puzzleLevels` export. Combat and puzzle should both feel *in the same game*, not two demos stapled together.

**Anchors:** `roadmap.md` (strategic forks + suggestion), `levels.md` (loader truth), `src/data/rooms/puzzles.ts` (`puzzlePrismaticVault`), `src/data/rooms/act1.ts` (`act1Levels`), `src/data/rooms/tutorial.ts` (`tutorialLevels`, help room → Act 1 index 7).

---

## Implementation status (code landed)

Epics **A1–A6**, **B1, B2, B4**, **D1**, **E2** (`levels.md` + this appendix) are implemented in the repo. **B3** is a *thin* slice (one main-shaft room, not 2–4). **C1–C4, B5, D2, D3, E1, E3** remain open or need human QA. See checkboxes in §2 below.

---

## 1. Design thesis (why this shape)

### 1.1 Player fantasy

After the help scroll, the player should feel **freedom** (“the training wheels are off”) **without** a blank cliff. A short **authored corridor** does three jobs:

- Proves the **dungeon is dangerous** (combat tuned for someone who just finished the tutorial).
- Introduces **optional depth** (a side door or landmark: “something weird/special over there”).
- Keeps **scope bounded**: one branch, one optional puzzle room, one clear “Act 1 complete” or “you may enter the deeper dungeon” moment—without committing to full chapter select or roguelike meta yet.

### 1.2 Why the vault is optional (not gating)

- **Skill variance:** Some players love beam puzzles; others want to push through. Optional content respects both and avoids a hard “puzzle wall” on the critical path.
- **Risk / reward (tunable):** The vault currently offers **`fire_wand`** (`puzzles.ts`). That’s a strong reward for solving a non-combat problem; the *main* path can assume **sling/crossbow** progression so skipping the vault is still viable.
- **Brand:** “Vimgeon” reads as **tactical grid + cerebral ASCII**; one visible puzzle branch signals that **without** making every room a puzzle.

### 1.3 Thin slice of “puzzle layer” (what we are *not* doing yet)

| In scope | Out of scope (defer) |
|----------|----------------------|
| One merged **campaign level list** (or explicit chapter array) that includes vault + combat rooms | Second puzzle track, chapter select UI, `storyLevels` as a separate game mode |
| Vault reachable from **one** hub or fork room via **door `targetLevel`** | New puzzle systems beyond existing `lightPuzzle` |
| Return edge from vault **into** the same Act 1 graph | Save slots, meta unlocks, procedural replacement of this arc |
| Copy/signs that sell the vault **in-world** | Full narrative arc (`story.md` still can stub names only) |

### 1.4 Suggested narrative frame (placeholder‑friendly)

Use **place names** even if lore is thin:

- **Threshold** — first room after the tutorial gate (replaces or precedes immediate procedural drop).
- **Fork** — room with a **sign or visual corridor** (“side passage: refracted seal” / “main shaft”).
- **Prismatic Vault** — keep puzzle; rename banner from `Puzzle: …` to something diegetic when production polish lands.
- **Limnel shaft (main)** — 2–4 combat rooms with escalating pressure.
- **Act 1 terminus** — door into **`startDungeonRun`** (existing procedural dungeon) *or* a named “descent” sign so the player understands the hand‑crafted bit ended.

You can rename in tickets once `story.md` gets a paragraph of truth.

### 1.5 Pacing sketch (example, not prescriptive)

1. **Threshold** — one safe beat (sign, layout breath), maybe one weak enemy.
2. **Fork** — visible branch; main exit obvious, side exit framed as “sealed / curiosity.”
3. **Optional:** Vault → loot → **return** to fork’s continuation index (not tutorial index `5`).
4. **Main:** 2–4 rooms, mixing cover + ranged enemies + barrel teach‑back.
5. **Terminus** — message + south/gate into procedural run or next milestone.

### 1.6 Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Wrong `targetLevel` after merging arrays → **softlock or wrong room** | Single source of truth for level order; `:warp` dev command; `levels.md` table updated in same PR as graph |
| Vault feels like a **minigame** (no combat) | Short combat on main path before/after; signpost reward; optional is OK—don’t force a fight *inside* the vault unless design wants it |
| Help scroll promises **only** procedural dungeon | Update sign/hint text when Act 1 exists |
| Two loaders (`tutorial` vs `puzzle`) confuse contributors | One `campaignLevels` (or `act1Levels` appended after init) + comments with **indices** |

---

## 2. Production‑readiness definition of done (exit criteria)

Use this as the bar before calling the branch “shippable.” *Checkboxes below reflect **implemented in code** vs **still owed**; human playtest and polish rows stay open until someone runs them.*

- [x] **Cold start → tutorial → help gate → Act 1** flows without hacks (no manual `loadLevel` in console required for happy path).
- [x] **Optional vault:** enter from fork, solve light puzzle, claim loot, exit **south** into a room that **continues Act 1** (not tutorial “complete” unless intentionally).
- [x] **Skip vault:** main path is completable with **no** puzzle requirement; difficulty still fair for post‑tutorial loadout. *(Balance subject to playtest.)*
- [x] **Indices / doors:** every `targetLevel` matches merged array order; grepping `targetLevel` finds a documented row in `levels.md` (or this doc’s appendix).
- [ ] **`:help`:** at least one line in **controls** or **world** section mentions the light beam / vault *if* the player can soft‑miss the in‑room sign (optional). *(`:warp` documented; vault / beam tip not added yet.)*
- [ ] **Playtest script** (10–15 min) completed twice: with vault, without vault.
- [x] **No regression:** `startDungeonRun` / procedural dungeon still launches from the agreed terminus.

---

## 3. Ticket backlog (copy into GitHub Issues / Linear)

Labels suggestion: `epic:act1`, `content`, `engine`, `puzzle`, `polish`, `docs`.

### Epic A — Level graph & loader (engine + data)

| ID | Title | Status |
|----|--------|--------|
| A1 | **Define canonical post‑tutorial level ordering** | Done — `levels.md` + §4 appendix |
| A2 | **Implement unified level registration in `App.tsx` / `gameState`** | Done — `initTutorialLevels([...tutorialLevels, ...act1Levels])` |
| A3 | **Rewire help room exit to Act 1 entry** | Done — `targetLevel: 7`, sign updated |
| A4 | **Fix vault south door `targetLevel`** | Done — targets **10** (`act1MainShaft`) |
| A5 | **Add vault entry from fork** | Done — east door **8 → 9** |
| A6 | **Dev ergonomics: `:warp <n>`** | Done — `executeCommand` + `:help` controls line |

### Epic B — Act 1 combat content (authored rooms)

| ID | Title | Status |
|----|--------|--------|
| B1 | **Room: Threshold** | Done |
| B2 | **Room: Fork** | Done |
| B3 | **Room(s): Main shaft (2–4 rooms)** | Partial — **one** combat room (`act1MainShaft`); expand later |
| B4 | **Room: Terminus** | Done |
| B5 | **Enemy & pickup pass** | Open — informal placement only |

### Epic C — Vault (puzzle slice, production polish)

| ID | Title | Status |
|----|--------|--------|
| C1 | **Rename & frame Prismatic Vault** | Open — still `Puzzle: Prismatic Vault` |
| C2 | **Validate light puzzle** | Open — needs manual regression note |
| C3 | **`fire_wand` balance** | Open |
| C4 | **Loot clarity** | Open |

### Epic D — Copy, help, onboarding

| ID | Title | Status |
|----|--------|--------|
| D1 | **Update help scroll sign** | Done |
| D2 | **`:help` stub or real tip** (beam / vault) | Open |
| D3 | **Tutorial complete messaging** | Open — review if copy still accurate |

### Epic E — QA, docs, polish

| ID | Title | Status |
|----|--------|--------|
| E1 | **Playtest checklist** | Open |
| E2 | **Update `levels.md` + `roadmap.md`** | Partial — `levels.md` done; `roadmap.md` link optional |
| E3 | **Messages & color pass** | Open |

### Epic F — Follow‑ups (explicitly not blocking v1 of this branch)

| ID | Title | Notes |
|----|--------|--------|
| F1 | Persistent save after Act 1 | `roadmap.md` medium term. |
| F2 | Second puzzle room | When vault proves pipeline. |
| F3 | Boss at terminus | Optional escalation. |

<details>
<summary>Original ticket text (full acceptance criteria)</summary>

### Epic A — Level graph & loader (engine + data)

| ID | Title | Description | Acceptance criteria |
|----|--------|-------------|---------------------|
| A1 | **Define canonical post‑tutorial level ordering** | Decide merged array shape: e.g. `tutorialLevels` unchanged (0–6), then `act1Levels` appended, *or* replace help room’s `startDungeonRun` with `targetLevel: 7` into Act 1. Document final order in `levels.md` + appendix below. | Table lists every index, export name, door targets; team agrees single ordering. |
| A2 | **Implement unified level registration in `App.tsx` / `gameState`** | Today `initTutorialLevels(tutorialLevels)` only. Add e.g. `initCampaignLevels([...tutorialLevels, ...act1Levels])` or append vault + rooms in one array; rename internal `getTutorialLevels` → `getCampaignLevels` if it now serves both (optional follow‑up ticket). | `loadLevel(n)` resolves all Act 1 + vault indices; no throw; tutorial 0–6 unchanged. |
| A3 | **Rewire help room exit to Act 1 entry** | Replace or sequence `startDungeonRun: true` so player hits **Threshold** (index 7) first; procedural run fires from terminus door only. | Help scroll copy matches behavior; walking south opens Act 1. |
| A4 | **Fix vault south door `targetLevel`** | `puzzlePrismaticVault` currently targets `5` (tutorial complete). Point to **return room index** on main branch (e.g. fork continuation or next hub). | After vault, player is on main path; no duplicate tutorial room. |
| A5 | **Add vault north / entry door from fork room** | Fork room door: `targetLevel` = vault index; gate `reach` or key later—default `reach`. | Player can enter vault from Act 1 without cheats. |
| A6 | **Dev ergonomics: `:warp <n>` or debug key** | Speeds iteration when indices shift (per `roadmap.md`). | Document in README or help; safe guard in prod build optional. |

### Epic B — Act 1 combat content (authored rooms)

| ID | Title | Description | Acceptance criteria |
|----|--------|-------------|---------------------|
| B1 | **Room: Threshold** | Layout, sign, 0–1 enemy, teaches “you’re not in tutorial.” | Loads at Act 1 entry; messages proofread. |
| B2 | **Room: Fork** | Clear main vs side path; sign teases vault **without** spoiling solution. | Both exits have correct `targetLevel`; geometry readable in 80×30 grid. |
| B3 | **Room(s): Main shaft (2–4 rooms)** | Mix ranged/melee enemies, cover, optional barrel; tuned for post‑tutorial HP. | Winnable without vault loot; interesting with wand if obtained. |
| B4 | **Room: Terminus** | Sign + door to `startDungeonRun` or next system; player understands transition. | Procedural dungeon launches; state reset rules unchanged except intended. |
| B5 | **Enemy & pickup pass** | Cross‑check `monsters.md` / `items.md`; no duplicate teach; difficulty curve monotonic. | Brief note in PR; no broken pickups. |

### Epic C — Vault (puzzle slice, production polish)

| ID | Title | Description | Acceptance criteria |
|----|--------|-------------|---------------------|
| C1 | **Rename & frame Prismatic Vault** | In‑game `name`, sign header, hints—diegetic tone; keep mechanic text accurate. | No “Puzzle:” dev prefix if shipping. |
| C2 | **Validate `lightPuzzle` + `gateCondition: 'light_puzzle'`** | Regression after tick rate / projectile changes; north door opens once solved. | Manual test + note in playtest script. |
| C3 | **`fire_wand` balance vs main path** | If wand trivializes Act 1, reduce charges or gate; if vault optional, ensure main path has ammo sanity. | Designer sign‑off in playtest. |
| C4 | **Loot clarity** | Yank message / `:inv` discoverability; consider floor pickup feedback when leaving vault. | Player test (n=1–2) finds wand. |

### Epic D — Copy, help, onboarding

| ID | Title | Description | Acceptance criteria |
|----|--------|-------------|---------------------|
| D1 | **Update help scroll sign** (`tutorialLevelHelp`) | Remove or qualify “exit begins procedural dungeon” if Act 1 sits in between. | Matches A3. |
| D2 | **`:help` stub or real tip** | One paragraph on light beam / mirrors / `R` sensor **or** hide until first vault discovery—pick consciously. | No empty promise in help. |
| D3 | **Tutorial complete / east exit messaging** | If flow changes (extra lesson room), sync `tutorialComplete` sign. | No contradictory instructions. |

### Epic E — QA, docs, polish

| ID | Title | Description | Acceptance criteria |
|----|--------|-------------|---------------------|
| E1 | **Playtest checklist** | Paths: vault + main; main only; failure: death in Act 1; restart from Act 1 entry (if supported). | Checkbox file or section in `README`. |
| E2 | **Update `levels.md` + `roadmap.md`** | Reflect merged loader; link to this doc. | Single source of truth. |
| E3 | **Messages & color pass** | Act 1 banners use `COLORS` consistently; no spam on door open. | Quick audit. — optional **E4** smoke E2E or vitest if project adds harness later. |

</details>

---

## 4. Appendix — index map *(filled)*

| Index | Export / source | Notes |
|------|-----------------|-------|
| 0–6 | `tutorialLevels` | Help room (6): south → 7 after `:help`. |
| 7 | `act1Threshold` | First post‑help room. |
| 8 | `act1Fork` | East → vault (9); south → main shaft (10). |
| 9 | `puzzlePrismaticVault` | Optional vault; south → **10**. |
| 10 | `act1MainShaft` | Combat rejoin. |
| 11 | `act1Terminus` | `startDungeonRun` → procedural dungeon. |

**Vault return:** south door → index **10** (`act1MainShaft`).

---

## 5. Cross‑links

- **`brainstorming/roadmap.md`** — strategic suggestion and forks.
- **`brainstorming/levels.md`** — tutorial + puzzle room inventory.
- **`brainstorming/story.md`** — replace placeholder names when lore exists.
- **`src/data/rooms/puzzles.ts`** — vault definition.
- **`src/engine/gameState.ts`** — `loadLevel`, `initTutorialLevels`, `startDungeonRun`.

---

*Living doc: update the appendix when indices land; close tickets when DoD (section 2) is satisfied.*
