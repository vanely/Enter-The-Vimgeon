import type { RoomTemplate } from './types';

/**
 * Layout characters that always block walking (unless an uncollected pickup
 * occupies that cell — see `terrainBlocksMovement`).
 * Like a rigidbody / static collider layer on the ASCII map.
 */
const DEFAULT_TERRAIN_SOLIDS = new Set<string>(['#', '*', '+']);

function terrainSolidSet(room: RoomTemplate | null): Set<string> {
  const s = new Set(DEFAULT_TERRAIN_SOLIDS);
  if (room?.collisionChars) {
    for (const c of room.collisionChars) {
      if (c.length === 1) s.add(c);
    }
  }
  return s;
}

/** Whether this layout character is solid terrain for movement. */
export function terrainBlocksMovement(char: string, room: RoomTemplate | null): boolean {
  return terrainSolidSet(room).has(char);
}
