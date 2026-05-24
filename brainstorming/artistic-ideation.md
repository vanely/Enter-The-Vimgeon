# Artistic ideation

**Art direction (draft, one paragraph):** A terse, high-contrast terminal dungeon where **every glyph earns its place**—doors and actors read instantly, puzzle light and projectiles use a restrained accent palette, and flavor (flames, runes) stays Tier-4 optional so combat never turns into glyph soup. Tone leans **manual-dry signs + neutral system log**, with mood (horror-ish / whimsical) picked once for Act 1 and held consistent.

Brainstorming look, feel, tone, and presentation—not mechanics. Pair with `story.md` for narrative; with `roadmap.md` for what ships when; with `engine-production.md` for what the simulation can animate safely.

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

## ASCII art style — robust & readable (production rules)

These are **design constraints** so art direction doesn’t fight combat clarity as content scales.

### Glyph tiers

| Tier | Role | Examples | Rules |
|------|------|----------|--------|
| **Tier 0 — Terrain** | Walkable / wall / hazard | `. #` (+ room-specific solids) | Never animate glyph; reserve for collision truth. |
| **Tier 1 — Actors** | Player, enemies | `@`, `g`–`z` band | One primary cell per entity; multi-cell bosses are a **conscious** exception with a locked silhouette spec. |
| **Tier 2 — Interactive** | Doors, brackets, containers | `\| - _` doors, `()` `[]` `{}` | Door vocabulary must stay **consistent game-wide** (`levels.md` + code share the same legend). |
| **Tier 3 — FX** | Projectiles, beams, embers | `> ^ *` | Motion allowed; cap **update rate** vs tick so players can still count tiles. |
| **Tier 4 — Flavor** | Decorative torch, optional flame sketch | `*` variants, paren stacks | Optional; must not share Tier 1 silhouettes. |

### Silhouette & contrast

- **Silhouette test** — At a glance, can the player name “enemy / projectile / door / floor”? If two things share a glyph + similar color, fix one.
- **Color budget** — Prefer **few** semantic colors: floor neutral, danger warm, puzzle cool, story accent reserved. Don’t color every enemy differently until tiering is documented.
- **Grid size** — Wide rooms are pretty but dilute tension; **choke readability** belongs in encounter design (`monsters.md`), not only layout.

### Linear “read” for progression (visual)

Even without cutscenes, progression can **read** through ASCII:

- **Chapter headers** — Same banner pattern in messages when entering a new act (`-- Act name --`).
- **Escalation** — Slightly denser clutter or richer props *after* a teaching room, not before.
- **Boss foreshadow** — Unique glyph or **two-line ASCII mark** outside the room ( etched frame, double doors) — spec in `levels.md` when used.

## Fire / flame (ASCII concept — not implemented)

Direction for a **fire wand**, braziers, or hazards: layered parens as the body, sparse `.` and `*` above as **embers** that read as drifting **upward** across animation frames (cycle positions or phase so dots climb and despawn at the top).

**Shape sketch** (multi-line; parens suggest a tapered flame):

```
      .       .
    .       *
       .  *
         (
        ( )
       (   )
```

**Motion ideas**

- **Top / opening parenthesis** — Alternate which side “leans” (e.g. flip the small top `(` with its mirror, or swap adjacent glyph pairs) on a slow tick so the tip **flicks** left/right like a candle.
- **Embers** — Dots rise frame-to-frame; `*` as slightly hotter sparks, fewer in number, faster vertical phase or occasional lateral jitter.
- **Base** — Wider rows `( )` / `(   )` stay mostly stable; optional subtle color pulse on accent (warm orange/red in `COLORS`) without changing glyphs every frame.

*Implementation TBD; when building, keep the footprint small so projectiles and combat readability stay primary.*

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
