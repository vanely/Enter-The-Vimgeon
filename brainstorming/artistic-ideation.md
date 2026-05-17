# Artistic ideation

Brainstorming look, feel, tone, and presentation—not mechanics. Pair with `story.md` for narrative; with `roadmap.md` for what ships when.

## Core metaphor

- **Text as matter** — The dungeon is something that was typed, edited, or compiled. Walls might feel like margins; enemies like glitches or aggressive autocompletion.
- **Terminal soul, game clarity** — Monospace and command-line cues, but contrast and silhouette tuned so combat reads at a glance (projectiles, barrels, doors).

## Visual language

| Axis | Ideas | Open choices |
|------|--------|----------------|
| **Palette** | Deep bg, limited accent colors (you already lean this way in `COLORS`). | Cool vs warm “danger”; one reserved color for story-critical UI only? |
| **ASCII / tiles** | Stay pure ASCII for grid, or allow a few “special” glyphs for bosses? | Consistency vs memorability |
| **Light** | Light puzzle already uses beam metaphor—extend “glow” to rare props (runes, cursors)? | Risk of visual noise on small grid |
| **UI chrome** | HUD as status line; help as `:help` buffer; death as corrupted buffer? | How much chrome vs grid space |

## Typography & UI

- **Fonts** — JetBrains Mono / Fira Code already signal “editor.” Consider one display font for titles only (title screen, chapter cards) vs in-grid strict mono.
- **Motion** — Subtle: cursor blink on command line, door “creak” as color pulse, hit flash on `@`. Avoid busy particle systems that fight ASCII legibility.
- **Signs & copy** — In-world text can be slightly archaic or manual-page dry; system messages slightly wry or neutral—pick one voice and stick to it.

## Mood & genre dressing

- **Horror-adjacent** — Lonely terminal, unseen typist, something wrong with the buffer.
- **Whimsical** — Syntax monsters, friendly `:wq` jokes; lower stakes.
- **Mythic / ritual** — Commands as spells; the dungeon as liturgy.

*(Choose a default mood for Act 1; side rooms can bend the tone.)*

## Audio (future)

- **Ambience** — Fan hum, disk seek, rain on glass—suggests machine without requiring chiptune.
- **Combat** — Short, dry clicks/thuds; dodge could be a “whoosh” or tape rewind.
- **Silence** — Legitimate option for puzzle rooms so beam ticks read clearly.

## References (mood board, not requirements)

- Late-night IDE sessions, CRT curvature optional.
- Games that do a lot with little: minimal roguelikes, `crawl` gods as text, `hack`/`nethack` flavor.
- Non-games: man pages, `vimtutor`, error messages as poetry.

## Anti-patterns to watch

- **Too many colors on the grid** — Enemies, projectiles, and terrain need a clear hierarchy.
- **Irony without warmth** — “Vim hard” jokes age fast; anchor humor in character or place if you use it.
- **Photoreal UI** — Would fight the ASCII grid unless you commit to a full style break.

## Next steps when this doc “locks”

1. Write a **one-paragraph art direction** summary at the top (tone + palette sentence).
2. Add **3–5 reference images or links** (even private) to a folder or section here.
3. Translate choices into **`COLORS` / component tokens** in code when ready—not before the words agree.

---

*Living doc: scratch rows in the tables, replace open choices with decisions as you make them.*
