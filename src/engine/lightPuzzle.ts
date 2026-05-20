import type { RoomTemplate } from './types';
import { doorCellAt } from './doorGeometry';

function doorKeyAt(x: number, y: number): string {
  return `${x},${y}`;
}

/** 90° reflection for `/` and `\` mirrors (incoming direction → outgoing). */
export function reflectMirror(mirrorChar: string, dx: number, dy: number): { dx: number; dy: number } {
  if (mirrorChar === '/') {
    if (dx === 1 && dy === 0) return { dx: 0, dy: -1 };
    if (dx === -1 && dy === 0) return { dx: 0, dy: 1 };
    if (dx === 0 && dy === 1) return { dx: 1, dy: 0 };
    if (dx === 0 && dy === -1) return { dx: -1, dy: 0 };
  }
  if (mirrorChar === '\\') {
    if (dx === 1 && dy === 0) return { dx: 0, dy: 1 };
    if (dx === -1 && dy === 0) return { dx: 0, dy: -1 };
    if (dx === 0 && dy === 1) return { dx: -1, dy: 0 };
    if (dx === 0 && dy === -1) return { dx: 1, dy: 0 };
  }
  return { dx, dy };
}

/** Whether a light pulse may enter this cell (same rules as the old beam). */
export function cellAllowsLight(
  room: RoomTemplate,
  x: number,
  y: number,
  doorStates: Map<string, boolean>,
): boolean {
  if (y < 0 || y >= room.height || x < 0 || x >= room.width) return false;
  const ch = room.layout[y]?.[x] ?? ' ';
  if (ch === '#' || ch === '+') return false;
  if (ch === '*') return false;
  if (ch === `'`) return true;
  if (ch === '/' || ch === '\\') return true;
  if (ch === 'R' || ch === 'S') return true;
  if (ch === '|' || ch === '-' || ch === '_') {
    const open = doorStates.get(doorKeyAt(x, y)) ?? false;
    return doorStates.has(doorKeyAt(x, y)) && open;
  }
  if (ch === ' ') return true;
  return ch !== ' ';
}

export function openLightPuzzleDoors(room: RoomTemplate, doorStates: Map<string, boolean>): void {
  for (const door of room.doors) {
    if (door.gateCondition !== 'light_puzzle' || door.open) continue;
    door.open = true;
    for (let i = 0; i < door.chars.length; i++) {
      const p = doorCellAt(door, i);
      doorStates.set(doorKeyAt(p.x, p.y), true);
    }
  }
}
