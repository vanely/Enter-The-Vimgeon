import type { Door } from './types';

/** Nth tile occupied by this door (horizontal: +x, vertical: +y). */
export function doorCellAt(door: Door, index: number): { x: number; y: number } {
  if (door.orientation === 'vertical') {
    return { x: door.pos.x, y: door.pos.y + index };
  }
  return { x: door.pos.x + index, y: door.pos.y };
}
