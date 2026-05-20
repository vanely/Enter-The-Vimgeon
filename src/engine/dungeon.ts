import type { RoomTemplate, Door, Position, DungeonCell, DungeonRoomKind } from './types';
import {
  DUNGEON_GRID_H,
  DUNGEON_GRID_W,
  instantiateDungeonRoom,
} from '../data/rooms/dungeonRooms';

const cellKey = (x: number, y: number) => `${x},${y}`;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Isaac-style-ish growth: BFS from center until room count reached.
 */
export function generateDungeonFloor(floorIndex: number): {
  grid: (DungeonCell | null)[][];
  startGridPos: Position;
} {
  const targetRooms = Math.min(
    16,
    Math.max(5, Math.floor(5 + floorIndex * 2 + Math.random() * 3)),
  );

  const grid: (DungeonCell | null)[][] = Array.from({ length: DUNGEON_GRID_H }, () =>
    Array.from({ length: DUNGEON_GRID_W }, () => null),
  );

  const cx = Math.floor(DUNGEON_GRID_W / 2);
  const cy = Math.floor(DUNGEON_GRID_H / 2);
  const occupied = new Set<string>([cellKey(cx, cy)]);
  const queue: Position[] = [{ x: cx, y: cy }];

  const dirs: Position[] = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  while (occupied.size < targetRooms && queue.length > 0) {
    const cur = queue.shift()!;
    if (occupied.size >= targetRooms) break;

    const neighbors = shuffle(
      dirs
        .map((d) => ({ x: cur.x + d.x, y: cur.y + d.y }))
        .filter(
          (p) =>
            p.x >= 0 &&
            p.x < DUNGEON_GRID_W &&
            p.y >= 0 &&
            p.y < DUNGEON_GRID_H &&
            !occupied.has(cellKey(p.x, p.y)),
        ),
    );

    for (const p of neighbors) {
      if (occupied.size >= targetRooms) break;
      if (Math.random() < 0.55) {
        occupied.add(cellKey(p.x, p.y));
        queue.push(p);
      }
    }
  }

  if (occupied.size < 5) {
    for (const d of dirs) {
      const p = { x: cx + d.x, y: cy + d.y };
      if (p.x >= 0 && p.x < DUNGEON_GRID_W && p.y >= 0 && p.y < DUNGEON_GRID_H) {
        occupied.add(cellKey(p.x, p.y));
      }
    }
  }

  const positions: Position[] = Array.from(occupied).map((k) => {
    const [x, y] = k.split(',').map(Number);
    return { x, y };
  });

  let farthest = positions[0]!;
  let maxDist = -1;
  for (const p of positions) {
    const d = Math.abs(p.x - cx) + Math.abs(p.y - cy);
    if (d > maxDist) {
      maxDist = d;
      farthest = p;
    }
  }

  const midDist = positions
    .filter((p) => p.x !== cx || p.y !== cy)
    .sort(
      (a, b) =>
        Math.abs(b.x - cx) +
        Math.abs(b.y - cy) -
        (Math.abs(a.x - cx) + Math.abs(a.y - cy)),
    )[0];

  const treasureCandidates = positions.filter(
    (p) =>
      (p.x !== cx || p.y !== cy) &&
      (p.x !== farthest.x || p.y !== farthest.y),
  );
  const trPos = treasureCandidates[Math.floor(Math.random() * treasureCandidates.length)] ?? {
    x: cx + 1,
    y: cy,
  };

  let idSeq = 0;
  for (const p of positions) {
    let kind: DungeonRoomKind = 'combat';
    if (p.x === cx && p.y === cy) kind = 'start';
    else if (p.x === farthest.x && p.y === farthest.y) kind = 'boss';
    else if (p.x === trPos.x && p.y === trPos.y) kind = 'treasure';
    else if (midDist && p.x === midDist.x && p.y === midDist.y && kind === 'combat') {
      kind = Math.random() < 0.35 ? 'arena' : 'combat';
    }

    grid[p.y][p.x] = {
      kind,
      id: `d${floorIndex}_${idSeq++}_${p.x}_${p.y}`,
    };
  }

  return { grid, startGridPos: { x: cx, y: cy } };
}

export function neighborsWithRooms(
  grid: (DungeonCell | null)[][],
  gx: number,
  gy: number,
): { north: boolean; south: boolean; east: boolean; west: boolean } {
  return {
    north: gy > 0 && grid[gy - 1]?.[gx] != null,
    south: gy < grid.length - 1 && grid[gy + 1]?.[gx] != null,
    west: gx > 0 && grid[gy]?.[gx - 1] != null,
    east: gx < (grid[0]?.length ?? 0) - 1 && grid[gy]?.[gx + 1] != null,
  };
}

/** Build a playable RoomTemplate for one dungeon grid cell, including dungeonDelta on doors. */
export function materializeDungeonRoom(
  grid: (DungeonCell | null)[][],
  floorIndex: number,
  gx: number,
  gy: number,
): RoomTemplate {
  const cell = grid[gy][gx];
  if (!cell) {
    throw new Error(`No dungeon cell at ${gx},${gy}`);
  }
  const n = neighborsWithRooms(grid, gx, gy);
  const room = instantiateDungeonRoom(cell.kind, floorIndex, cell.id, n);

  const attachDelta = (door: Door, ddx: number, ddy: number) => {
    (door as Door).dungeonDelta = { dx: ddx, dy: ddy };
    if (door.gateCondition === undefined) door.gateCondition = 'reach';
  };

  for (const door of room.doors) {
    const iy = door.pos.y;
    const ix = door.pos.x;
    if (iy === 0) attachDelta(door, 0, -1);
    else if (iy === room.height - 1) attachDelta(door, 0, 1);
    else if (ix === 0) attachDelta(door, -1, 0);
    else if (ix === room.width - 1 || (door.chars.length === 4 && ix === room.width - 2)) attachDelta(door, 1, 0);
  }

  return room;
}
