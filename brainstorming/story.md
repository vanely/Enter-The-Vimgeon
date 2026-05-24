# Story

Brainstorming how **movement, combat, items, weapons, and levels** connect into a coherent player journey: tone, beats, reveals, and **copy surfaces** (signs, `:help`, death text). This doc is **narrative + UX contract**; mechanical truth stays in `levels.md` / engine types.

---

## Premise (draft — replace when voice is chosen)

You wake as **`@` in a buffer that behaves like a dungeon**: motion is language, danger is syntax, and the world resets poorly typed ideas. You are not given a full monologue up front — **signs and short buffer lines** carry lore so tutorial pacing stays tight.

**Tone constraint:** Pair with `artistic-ideation.md`: manual-dry signs + neutral system log. Horror vs whimsical is an **Act-level** decision; don’t mix in one corridor.

---

## Act / chapter outline

| Act | Locations (`levels.md`) | New mechanics (player-facing) | Story beat |
|-----|-------------------------|--------------------------------|------------|
| **Prologue** | Tutorial 0–6 | hjkl, modes, yank, inv, combat primer, `:help` gate | “The buffer teaches before it punishes.” |
| **Act 1 — Limnel shaft** | 7–11 + vault branch | Fork, optional light puzzle, **main shaft pressure**, descent to proc | “Training ends; the depth has a name.” |
| **Endless / practice** | Procedural dungeon | Spiky difficulty, bestiary fill | “The dungeon keeps generating drafts.” |

Later acts add rows here **before** new `actN.ts` files.

---

## Place glossary (placeholder-safe names)

Names are **stable keys** for tickets and signs even if lore is thin:

| Place key | Player sees (example) | Role |
|-----------|----------------------|------|
| `threshold` | Act 1: The Threshold | First danger after `:help` |
| `fork` | Act 1: Fork in the Shaft | Optional vault vs main |
| `prismatic_vault` | Puzzle: Prismatic Vault (rename later) | Optional mastery + wand |
| `main_shaft` | Act 1: Main Shaft | Combat curriculum |
| `terminus` | Act 1: Descent | Hand-off to infinite dungeon |

Rename banners in a **single** polish pass tied to this table.

---

## Characters & factions

Keep cast **ASCII-friendly** (voices via signs, not portraits):

| Role | Working label | Notes |
|------|---------------|-------|
| Narrator / system | The buffer, the manual voice | Never contradicts HUD mechanics |
| Antagonist force | Unclear compiler / guardian | Escalates across acts |
| Future ally | TBD | Defer until paste/registers story hooks |

---

## Themes (tie mechanics to fiction)

- **Editor as world** — Motions double as magic; mastery is metaphor.
- **Correction** — Errors hurt; fixing (or escaping) matters more than “xp.”
- **Recursion** — Deeper acts can revisit tutorial verbs at higher stakes (same lesson, worse geometry).

---

## Copy checklist (production)

- **Sign budget** — 3–6 short lines per room; link to `:help` instead of repeating controls.
- **No false promises** — If Act 1 exists, help-scroll prose must not imply *only* procedural play.
- **Victory framing** — Define what “winning” a chapter means in one sentence per act.

---

## Open questions

- Why does the dungeon “speak” in command mode? *(Diegetic: manual spirit vs pure UI.)*
- What is victory? Escape? Mastery? Restoring a file? *(Pick one primary; others become extras.)*
- Do we name the player? *(Default: stay second-person.)*

---

## Cross-links

- `monsters.md` — who opposes the player and **what we call them** in signs vs code ids.
- `items.md` / `weapons.md` — diegetic names for loot.
- `levels.md` — where each story beat **physically** happens.
- `act1-vault-branch-tickets.md` — execution backlog for the Act 1 slice (separate from high-level story).

---

*Living doc: any banner or sign string change updates this outline or the glossary.*
