import type { ConsumableSpec, KeyItem, Position } from '../engine/types';

/*
 * WORLD / PICKUP ITEMS
 *
 * Templates are id + display only; rooms attach position (and collected starts false).
 * Weapon pickups use the same ids as src/data/weapons.ts so inventory lookup stays in sync.
 */

export interface ItemTemplate {
  name: string;
  char: string;
}

/** Charges granted each time a Flash Step pickup is yanked into inventory. */
export const FLASH_STEP_CHARGES_PER_PICKUP = 3;

export const ITEM_TEMPLATES: Record<string, ItemTemplate> = {
  iron_key: { name: 'Iron Key', char: '&' },
  silver_key: { name: 'Silver Key', char: '&' },
  sling: { name: 'Sling', char: '~' },
  health_potion: { name: 'Health Potion', char: '!' },
  crossbow: { name: 'Crossbow', char: 'T' },
  fire_wand: { name: 'Fire Wand', char: '*' },
  flash_step: { name: 'Flash Step', char: '^' },
};

/** Stackable consumables; equip then gg to use. */
export const CONSUMABLES: Record<string, ConsumableSpec> = {
  health_potion: { healHp: 5 },
};

export function lookupConsumable(itemId: string): ConsumableSpec | undefined {
  return CONSUMABLES[itemId];
}

export function keyItemAt(itemId: string, pos: Position): KeyItem {
  const t = ITEM_TEMPLATES[itemId];
  if (!t) {
    throw new Error(`Unknown item id: ${itemId}`);
  }
  return {
    id: itemId,
    name: t.name,
    char: t.char,
    pos: { ...pos },
    collected: false,
  };
}
