# Weapons

Brainstorming weapons the player can equip and fire with `d` (delete/destroy) when the equipped `InventoryItem` carries a `Weapon` spec. Melee **/`x`** is separate today — call out if a “melee weapon” row should modify `x` damage/cooldown when that exists.

**Implementation truth:** `src/data/weapons.ts` + `WEAPONS` registry. **Design here first** so projectile glyphs, ammo policy, and unlock beats stay consistent with `engine-production.md` (projectiles, barrels, friendly fire rules).

---

## Current baseline (code)

| Id | Name | Projectile | Dmg | `ammoType` | Notes |
|----|------|------------|-----|------------|-------|
| `sling` | Sling | `o` | 1 | `ammo`, max 10 | Default pressure weapon |
| `crossbow` | Crossbow | `+` | 2 | `ammo`, max 5 | Fewer shots, punch |
| `fire_wand` | Fire Wand | `*` | 1 | `cooldown`, 4 ticks | Vault reward; sustain DPS rhythm |

---

## Design axes (balance surfaces)

| Axis | Question | Failure mode |
|------|-----------|--------------|
| **Ammo vs cooldown** | Finite tension vs rhythmic spam? | Wand dominates if CD too low; sling dead if no pickups |
| **Damage / pierce / AoE** | Time-to-kill on 128×30 grid | One-shots erase dodge teaching |
| **Projectile glyph** | Readable vs terrain/enemy band? | Stars vs imps — keep distinct (`artistic-ideation.md` Tier 3) |
| **Unlock timing** | Tutorial vs Act 1 vs proc depth | Skipping branch must not hard-softlock DPS |
| **Barrel coupling** | Should this weapon **intentionally** chain explosions? | Doc exceptions in `combat` / `projectiles` |

---

## Weapon ideas backlog

| Name | Id sketch | Projectile | Dmg | Ammo / CD | Unlock / theme | Notes |
|------|-----------|------------|-----|-----------|----------------|-------|
| *(extend)* | | | | | | |
| Ice rod | `ice_rod` | `~` | 1 | cooldown | Optional frost zone | *Future:* slow debuff needs status in `types` |
| Piercing bolt | `arbalest` | `=` | 2 | ammo, low cap | Treasure room | *Future:* pierce flag on projectile |

---

## Combos & constraints

- **Light puzzle:** beam is **`owner: 'light'`** projectiles — weapons must not reuse collision rules that swallow puzzle beams without review (`projectiles.ts`).
- **Containers / keys:** firing into interactables — current behavior is code-defined; if a weapon **should** break crates, say so here and in `combat.ts` notes.
- **Multi-tile doors:** projectile path must respect door geometry (`doorGeometry.ts`); new weapons don’t get custom raycasts without a spec.

---

## Production checklist (per new weapon)

1. Id + name + glyph **approved** against ASCII tier rules.
2. **TTK sample** vs each `monsters.md` archetype at intended unlock.
3. **Ammo** source: room placement id or dungeon spawn rule.
4. `:help` / bestiary line if behavior is non-obvious (pierce, bounce, etc.).

---

## Tie-ins

- `monsters.md` — resistances / weak points when we add them.
- `levels.md` — showcase room + optional “deprived” test (no wand).
- `items.md` — ammo stacks if ammo is stored separately from the weapon row.

---

*Living doc: any weapon change updates this table and `src/data/weapons.ts` in the same design pass.*
