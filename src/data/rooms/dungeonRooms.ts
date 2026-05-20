import type { RoomTemplate, Door, DungeonRoomKind } from '../../engine/types';
import {
  hollowRoom,
  makeLayout,
  ROOM_H,
  ROOM_W,
  padLine,
  setCells,
  setFloorRow,
} from './tutorial';
import { createEnemy } from '../enemies';
import { keyItemAt } from '../items';

export const DUNGEON_GRID_W = 7;
export const DUNGEON_GRID_H = 7;

interface ExitSides {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

function doorNorth(x: number): Door {
  return {
    pos: { x, y: 0 },
    open: false,
    gateCondition: 'reach',
    chars: ['|', '|'],
  };
}

function doorSouth(x: number): Door {
  return {
    pos: { x, y: ROOM_H - 1 },
    open: false,
    gateCondition: 'reach',
    chars: ['|', '|'],
  };
}

function doorWest(y: number): Door {
  return {
    pos: { x: 0, y },
    open: false,
    gateCondition: 'reach',
    chars: ['_', '_', '_', '_'],
  };
}

function doorEast(y: number): Door {
  return {
    pos: { x: ROOM_W - 2, y },
    open: false,
    gateCondition: 'reach',
    chars: ['_', '_', '_', '_'],
  };
}

/** Interior width between | walls */
const IW = ROOM_W - 2;

export function instantiateDungeonRoom(
  kind: DungeonRoomKind,
  floorIndex: number,
  cellId: string,
  exits: ExitSides,
): RoomTemplate {
  const perimeter: import('./tutorial').PerimeterDoor[] = [];
  const cx = Math.floor((ROOM_W - 2) / 2) - 2;
  if (exits.north) perimeter.push({ side: 'north', x: cx + 4, chars: ['|', '|'] });
  if (exits.south) perimeter.push({ side: 'south', x: cx + 4, chars: ['|', '|'] });
  if (exits.west) perimeter.push({ side: 'west', y: Math.floor(ROOM_H / 2), chars: ['_', '_', '_', '_'] });
  if (exits.east) perimeter.push({ side: 'east', y: Math.floor(ROOM_H / 2), chars: ['_', '_', '_', '_'] });

  const rows =
    perimeter.length === 0
      ? hollowRoom([{ side: 'south', x: cx + 4, chars: ['|', '|'] }])
      : hollowRoom(perimeter);

  const doors: Door[] = [];
  if (exits.north) doors.push(doorNorth(cx + 4));
  if (exits.south) doors.push(doorSouth(cx + 4));
  if (exits.west) doors.push(doorWest(Math.floor(ROOM_H / 2)));
  if (exits.east) doors.push(doorEast(Math.floor(ROOM_H / 2)));

  const namePrefix = `Floor ${floorIndex + 1}`;
  let name = `${namePrefix} — ${kind}`;
  const signs: RoomTemplate['signs'] = [];
  const keys: RoomTemplate['keys'] = [];
  const enemies: RoomTemplate['enemies'] = [];
  const barrels: RoomTemplate['barrels'] = [];
  const containers: RoomTemplate['containers'] = [];

  const torchXs = [12, ROOM_W - 15];
  setCells(rows, [
    { x: torchXs[0], y: 5, ch: '*' },
    { x: torchXs[1], y: 5, ch: '*' },
    { x: torchXs[0], y: ROOM_H - 6, ch: '*' },
    { x: torchXs[1], y: ROOM_H - 6, ch: '*' },
  ]);

  const boost = Math.min(4, floorIndex);
  const px = Math.floor(IW / 2) + 1;
  const py = ROOM_H - 8;

  switch (kind) {
    case 'start':
      name = `${namePrefix} — Antechamber`;
      setCells(rows, [{ x: px, y: py, ch: '@' }]);
      signs.push({
        pos: { x: 16, y: 6 },
        text: [
          '  THE VIMGEON AWAITS      ',
          '',
          '  Exits lead to other     ',
          '  chambers on this floor. ',
          '  Defeat the marked room  ',
          '  to find the deep exit. ',
          '',
          '  Press any key…',
        ],
      });
      break;
    case 'combat':
      setCells(rows, [{ x: 18, y: py, ch: '@' }]);
      enemies.push(
        createEnemy('goblin_grunt', `${cellId}_g1`, { x: ROOM_W - 22, y: py }),
        createEnemy('goblin_grunt', `${cellId}_g2`, { x: ROOM_W - 18, y: py - 4 }),
      );
      break;
    case 'arena':
      setCells(rows, [{ x: 22, y: py, ch: '@' }]);
      enemies.push(
        createEnemy('slime', `${cellId}_s1`, { x: ROOM_W - 24, y: py - 2 }),
        createEnemy('dart_imp', `${cellId}_i1`, { x: ROOM_W - 20, y: py + 2 }),
      );
      barrels.push({ pos: { x: 48, y: py - 1 }, destroyed: false, explosionFrame: -1 });
      break;
    case 'treasure':
      name = `${namePrefix} — Reliquary`;
      setCells(rows, [{ x: 26, y: py, ch: '@' }]);
      keys.push(keyItemAt('health_potion', { x: ROOM_W - 35, y: py }));
      keys.push(keyItemAt('iron_key', { x: ROOM_W - 28, y: py - 3 }));
      containers.push({
        id: `${cellId}_gold`,
        pos: { x: ROOM_W - 40, y: py + 2 },
        char: 'O',
        openChar: 'o',
        bracketType: '(',
        item: keyItemAt('sling', { x: ROOM_W - 40, y: py + 2 }),
        opened: false,
      });
      break;
    case 'boss': {
      name = `${namePrefix} — Boss Chamber`;
      setCells(rows, [{ x: 30, y: py, ch: '@' }]);
      const bossHp = 8 + boost * 2;
      const boss = createEnemy('slime', `${cellId}_boss`, { x: ROOM_W - 26, y: py });
      enemies.push({
        ...boss,
        hp: bossHp,
        maxHp: bossHp,
        shootCooldown: 4,
        ai: 'chase_shoot',
      });
      enemies.push(createEnemy('dart_imp', `${cellId}_add`, { x: ROOM_W - 18, y: py - 5 }));
      break;
    }
    default:
      break;
  }

  const floorRowInner = padLine('.'.repeat(Math.max(0, IW - 20)) + '####'.repeat(3), IW);
  if (kind === 'arena') {
    setFloorRow(rows, 12, floorRowInner);
  }

  const layout = makeLayout(rows, ROOM_W, ROOM_H);

  return {
    name,
    width: ROOM_W,
    height: ROOM_H,
    layout,
    doors,
    signs,
    keys,
    enemies,
    barrels,
    containers,
  };
}
