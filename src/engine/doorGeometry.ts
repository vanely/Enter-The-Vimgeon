import type { Door } from './types';

/** Nth tile occupied by this door. Two chars: horizontal along +x (default) or vertical along +y if `orientation === 'vertical'`. Four chars: 2×2 block from `pos` (top-left), row-major (top row left→right, then bottom). */
export function doorCellAt(door: Door, index: number): { x: number; y: number } {
  if (door.chars.length === 4) {
    const dx = index % 2;
    const dy = Math.floor(index / 2);
    return { x: door.pos.x + dx, y: door.pos.y + dy };
  }
  if (door.orientation === 'vertical') {
    return { x: door.pos.x, y: door.pos.y + index };
  }
  return { x: door.pos.x + index, y: door.pos.y };
}
