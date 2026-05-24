# Items

Brainstorming collectible types: keys, consumables, quest objects, crafting bits, and anything that is **not strictly a weapon** but lives in inventory (or on the floor as `KeyItem` / container payload).

**Engine surfaces today:** `KeyItem`, `InventoryItem`, optional `ConsumableSpec` on rows, containers/barrels holding `KeyItem`, `pickupInventoryId` for stack merge. See `src/engine/types.ts`. **Design here first** so new pickups don’t force one-off code paths.

---

## Data model (production mental map)

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **Floor pickup** | `KeyItem` on grid; `y` / VISUAL grab | Loose key, potion glyph |
| **Inventory row** | `InventoryItem` with `count`, optional `weapon` / `consumable` | Stack of bandages |
| **Authoring id** | Stable string id for `:equip`, saves, logs | `rust_key`, `ration` |

Rules to keep the sim robust:

1. **One pickup → one inventory id** unless `pickupInventoryId` explicitly merges (e.g. ammo piles).
2. **Consumables** should declare a **small** `ConsumableSpec` surface (heal, buff ticks, cleansable status) — avoid “execute arbitrary script per item” until a modding story exists.
3. **Quest items** are non-combat rows with **no** `weapon` / `consumable` — engine treats them as inert unless a system explicitly reads their id.

---

## Categories

| Category | Purpose | Engine hook | Risk if we overgrow |
|----------|---------|-------------|---------------------|
| **Keys & doors** | Gate progress or side content | `requiredKey`, `unlockedKeys` | Key soup; every key needs a visible door row in `levels.md` |
| **Ammo** | Sustain ranged pressure | Weapon row `ammoType: 'ammo'` + shared stack id | Drop rate tuning per biome |
| **Consumables** | Heal, MP, short buffs | `ConsumableSpec` + `p` / UI use | Inventory clutter without quick-use or merge |
| **Utility** | Movement, vision, puzzle | Needs explicit system flags (future) | One-off flags explode `GameState` |
| **Quest / lore** | Narrative beats | Inventory id + story table | Must be droppable/storable policy (softlock) |

---

## Item ideas backlog

| Id / working name | Char (floor) | Stack? | Effect / use | Notes |
|-------------------|-------------|--------|--------------|-------|
| *(fill as designed)* | | | | |
| `ration` | `:` | yes (count) | Heal small (`ConsumableSpec`) | Tutorial-friendly name |
| `master_key` | `%` | no | Opens `requiredKey` class *if* we add key tiers | Needs design pass with doors |
| `vault_lens` | `*` | no | Puzzle-only: highlights beams (if we add UX) | Optional; may stay sign/tutorial |

---

## Economy & rarity

- **Authored rooms** place fixed pickups; **procedural** rooms eventually need **drop tables** keyed by `DungeonRoomKind` + depth — document tables here before coding.
- **Baseline run:** main path must be completable **without** vault loot (`items.md` + `weapons.md` agree on minimum kit).
- **Stack caps:** decide max count per id to keep HUD and balance readable (e.g. potions cap at 9 or 99).

---

## Verification (when items ship)

- Pickup, equip-if-weapon, consume-if-consumable, drop, save/load (when exists) — same id round-trip.
- No duplicate `InventoryItem` rows for the same logical stack unless intentional.

---

## Tie-ins

- `weapons.md` — ranged gear; ammo stacks as items if split from weapon row.
- `engine-production.md` — tick ownership for consumable effects, determinism.
- `story.md` — why this object exists in-world.
- `levels.md` — which room introduces each new category (one per teach).

---

*Living doc: new rows go through “id + glyph + stack + effect\" before PR.*
