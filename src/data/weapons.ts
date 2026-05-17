import type { Weapon } from '../engine/types';

/*
 * WEAPON DESIGN SPEC
 *
 * Each weapon defines a ranged attack fired with 'd' (delete/destroy).
 * Weapons must be picked up (vy or vi(y/vi{y) and equipped (:equip <id> or 'e' in inventory).
 *
 * ammoType:
 *   'ammo'     — finite shots. count field on InventoryItem tracks remaining ammo.
 *                When ammo reaches 0, weapon cannot fire. Find more ammo in the dungeon.
 *   'cooldown' — unlimited shots but must wait cooldownTicks between each.
 *                weaponCooldown in GameState tracks remaining ticks.
 *
 * Projectile chars should be single ASCII characters that are visually distinct
 * from enemies, terrain, and the player.
 *
 * Future weapon categories (not yet implemented):
 *   - Melee weapons: modify x strike damage/range (swords, daggers, staves)
 *   - Spell weapons: use MP, special effects (freeze, burn, teleport)
 *   - Legendary weapons: unique mechanics (e.g. :wq — "write and quit" one-shots a boss)
 */

export const WEAPONS: Record<string, Weapon> = {
  sling: {
    id: 'sling',
    name: 'Sling',
    projectileChar: 'o',
    damage: 1,
    ammoType: 'ammo',
    maxAmmo: 10,
    cooldownTicks: 0,
  },
  crossbow: {
    id: 'crossbow',
    name: 'Crossbow',
    projectileChar: '+',
    damage: 2,
    ammoType: 'ammo',
    maxAmmo: 5,
    cooldownTicks: 0,
  },
  fire_wand: {
    id: 'fire_wand',
    name: 'Fire Wand',
    projectileChar: '*',
    damage: 1,
    ammoType: 'cooldown',
    maxAmmo: null,
    cooldownTicks: 4,
  },
};
