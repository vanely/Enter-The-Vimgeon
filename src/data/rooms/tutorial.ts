import type { RoomTemplate } from '../../engine/types';
import { createEnemy } from '../enemies';
import { keyItemAt } from '../items';

/** Stage width in cells (ASCII columns) — wide for sub-rooms; shallow rows to fit under the HUD. */
export const ROOM_W = 128;
/** Stage height in cells (ASCII rows). */
export const ROOM_H = 30;

/** Interior width between vertical walls (`|` … `|`). */
const IW = ROOM_W - 2;

export function padLine(line: string, width: number): string {
  return line.padEnd(width).slice(0, width);
}

export function makeLayout(lines: string[], width: number, height: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < height; i++) {
    result.push(padLine(lines[i] || '', width));
  }
  return result;
}

function rowInterior(inner: string): string {
  return '|' + padLine(inner, IW) + '|';
}

function emptyInterior(): string {
  return '.'.repeat(IW);
}

function edgeHorizontalSolid(): string {
  return '+' + '-'.repeat(IW) + '+';
}

/** Carve perimeter exits: north/south use two `|`; east/west use four `_` in a 2×2 (row-major). */
export type PerimeterDoor =
  | { side: 'north' | 'south'; x: number; chars: string[] }
  | { side: 'east' | 'west'; y: number; chars: string[] };

export function setCell(rows: string[], x: number, y: number, ch: string): void {
  if (y < 0 || y >= ROOM_H || x < 0 || x >= ROOM_W) return;
  const line = rows[y];
  rows[y] = line.slice(0, x) + ch + line.slice(x + 1);
}

export function setCells(rows: string[], cells: { x: number; y: number; ch: string }[]): void {
  for (const c of cells) setCell(rows, c.x, c.y, c.ch);
}

/** Interior row index 0 = first row below the top wall. */
export function setFloorRow(rows: string[], floorIndex: number, inner: string): void {
  if (floorIndex < 0 || floorIndex >= ROOM_H - 2) return;
  rows[floorIndex + 1] = rowInterior(padLine(inner, IW));
}

function applyPerimeterDoor(rows: string[], d: PerimeterDoor): void {
  const chars = d.chars;
  const L = chars.length;
  if (L === 0) return;
  if (d.side === 'north') {
    for (let i = 0; i < L; i++) {
      setCell(rows, d.x + i, 0, chars[i]!);
    }
  } else if (d.side === 'south') {
    for (let i = 0; i < L; i++) {
      setCell(rows, d.x + i, ROOM_H - 1, chars[i]!);
    }
  } else if (d.side === 'west') {
    if (L === 4) {
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          setCell(rows, col, d.y + row, chars[row * 2 + col]!);
        }
      }
    } else {
      for (let i = 0; i < L; i++) {
        setCell(rows, 0, d.y + i, chars[i]!);
      }
    }
  } else if (d.side === 'east') {
    if (L === 4) {
      const x0 = ROOM_W - 2;
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          setCell(rows, x0 + col, d.y + row, chars[row * 2 + col]!);
        }
      }
    } else {
      for (let i = 0; i < L; i++) {
        setCell(rows, ROOM_W - 1, d.y + i, chars[i]!);
      }
    }
  }
}

/**
 * Closed rectangle with `-` / `+` top and bottom edges and `|` on the left/right of each floor row.
 * Pass `perimeterDoors` to carve exits; `undefined` = one centered south `||` exit.
 * Pass `[]` for a sealed box (no carved perimeter exits).
 */
export function hollowRoom(perimeterDoors?: PerimeterDoor[]): string[] {
  const top = edgeHorizontalSolid();
  const bottom = edgeHorizontalSolid();
  const mid = Array.from({ length: ROOM_H - 2 }, () => rowInterior(emptyInterior()));
  const rows = [top, ...mid, bottom];
  const doors: PerimeterDoor[] =
    perimeterDoors === undefined
      ? [{ side: 'south', x: Math.floor((ROOM_W - 2) / 2), chars: ['|', '|'] }]
      : perimeterDoors;
  for (const d of doors) {
    applyPerimeterDoor(rows, d);
  }
  return rows;
}

function centeredLabel(label: string): string {
  const L = label.length;
  const left = Math.max(0, Math.floor((IW - L) / 2));
  const right = IW - L - left;
  return '.'.repeat(left) + label + '.'.repeat(right);
}

function layoutLevel0(): string[] {
  const rows = hollowRoom([{ side: 'south', x: 100, chars: ['|', '|'] }]);
  setCells(rows, [
    { x: 15, y: 6, ch: '[' }, { x: 16, y: 6, ch: '?' }, { x: 17, y: 6, ch: ']' },
    { x: 28, y: 21, ch: '@' },
    { x: 7, y: 9, ch: '*' }, { x: 113, y: 9, ch: '*' },
    { x: 7, y: 24, ch: '*' }, { x: 113, y: 24, ch: '*' },
    { x: 59, y: 12, ch: '*' }, { x: 69, y: 18, ch: '*' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

function layoutLevel1(): string[] {
  const rows = hollowRoom([{ side: 'east', y: 18, chars: ['|', '|'] }]);
  setFloorRow(rows, 11, centeredLabel('LOCKED'));
  setCells(rows, [
    { x: 18, y: 7, ch: '[' }, { x: 19, y: 7, ch: '?' }, { x: 20, y: 7, ch: ']' },
    { x: 59, y: 21, ch: '@' },
    { x: 13, y: 10, ch: '*' }, { x: 105, y: 10, ch: '*' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

function layoutLevel2(): string[] {
  const rows = hollowRoom([{ side: 'north', x: 33, chars: ['|', '|'] }]);
  setCells(rows, [
    { x: 15, y: 6, ch: '[' }, { x: 16, y: 6, ch: '?' }, { x: 17, y: 6, ch: ']' },
    { x: 62, y: 24, ch: '@' },
    { x: 11, y: 10, ch: '*' }, { x: 113, y: 10, ch: '*' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

function layoutLevel3(): string[] {
  const rows = hollowRoom([{ side: 'west', y: 16, chars: ['_', '_', '_', '_'] }]);
  setCells(rows, [
    { x: 15, y: 6, ch: '[' }, { x: 16, y: 6, ch: '?' }, { x: 17, y: 6, ch: ']' },
    { x: 69, y: 23, ch: '@' },
    { x: 11, y: 14, ch: '*' }, { x: 113, y: 14, ch: '*' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

function layoutLevel4(): string[] {
  const rows = hollowRoom([{ side: 'south', x: 11, chars: ['|', '|'] }]);
  const widePair = `${'.'.repeat(8)}(${'..'.repeat(54)})${'.'.repeat(8)}`;
  setFloorRow(rows, 8, padLine(widePair, IW));
  setFloorRow(rows, 19, padLine(widePair, IW));
  setCells(rows, [
    { x: 15, y: 6, ch: '[' }, { x: 16, y: 6, ch: '?' }, { x: 17, y: 6, ch: ']' },
    { x: 66, y: 24, ch: '@' },
    { x: 11, y: 15, ch: '*' }, { x: 113, y: 15, ch: '*' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

function layoutComplete(): string[] {
  const rows = hollowRoom([{ side: 'east', y: 15, chars: ['_', '_', '_', '_'] }]);
  setCells(rows, [
    { x: 15, y: 7, ch: '*' }, { x: 100, y: 7, ch: '*' },
    { x: 15, y: 12, ch: '[' }, { x: 16, y: 12, ch: '?' }, { x: 17, y: 12, ch: ']' },
    { x: 57, y: 18, ch: '@' },
    { x: 36, y: 21, ch: '*' }, { x: 77, y: 21, ch: '*' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

function layoutHelp(): string[] {
  const rows = hollowRoom();
  setCells(rows, [
    { x: 13, y: 7, ch: '*' }, { x: 105, y: 7, ch: '*' },
    { x: 15, y: 10, ch: '[' }, { x: 16, y: 10, ch: '?' }, { x: 17, y: 10, ch: ']' },
    { x: 62, y: 18, ch: '@' },
    { x: 46, y: 23, ch: '*' }, { x: 77, y: 23, ch: '*' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

export const tutorialLevel0: RoomTemplate = {
  name: 'Tutorial: Awakening',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutLevel0(),
  doors: [
    {
      pos: { x: 100, y: ROOM_H - 1 },
      open: false,
      gateCondition: 'reach',
      targetLevel: 1,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 6 },
      text: [
        '  USE h/j/k/l TO MOVE   ',
        '',
        '  h = left   l = right   ',
        '  k = up     j = down    ',
        '',
        '  Exit is on the south   ',
        '  wall, toward the right.',
        '  Explore the room, then ',
        '  walk into the door.    ',
        '',
        '  * crystals block movement — pick up',
        '  ^ Flash Step (vy) for 3 charges; HUD shows',
        '  [^×n]. Press f * to blink onto a star.',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [keyItemAt('flash_step', { x: 40, y: 21 })],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'Move with hjkl. Pick up ^ (vy) for 3 Flash Step charges; HUD shows [^×n]. Use f * to jump to a * on your row. Exit south-right.',
  hintDelay: 8000,
};

export const tutorialLevel1: RoomTemplate = {
  name: 'Tutorial: The Locked Door',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutLevel1(),
  doors: [
    {
      pos: { x: ROOM_W - 2, y: 18 },
      open: false,
      gateCondition: 'command_open',
      requiredKey: 'iron_key',
      targetLevel: 2,
      chars: ['_', '_', '_', '_'],
    },
  ],
  signs: [
    {
      pos: { x: 18, y: 7 },
      text: [
        '  THE DOOR IS LOCKED!    ',
        '',
        '  Find the & key in this ',
        '  room. Stand on it,     ',
        '  press v then y to      ',
        '  pick it up. Then       ',
        '  use :open at the east  ',
        '  wall door.             ',
        '',
        '  Press Esc to return    ',
        '  to NORMAL mode.        ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [keyItemAt('iron_key', { x: 105, y: 23 })],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'Find the & key, stand on it, press v then y to pick it up.',
  hintDelay: 10000,
};

export const tutorialLevel2: RoomTemplate = {
  name: 'Tutorial: Containers',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutLevel2(),
  doors: [
    {
      pos: { x: 33, y: 0 },
      open: false,
      gateCondition: 'reach',
      targetLevel: 3,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 6 },
      text: [
        '  CONTAINERS             ',
        '',
        '  Barrels (?) and chests ',
        '  {?} or lockers [?]     ',
        '  hold valuable items    ',
        '',
        '  Stand next to one and  ',
        '  use vi(y for barrels,  ',
        '  vi{y for chests,       ',
        '  vi[y for lockers.      ',
        '',
        '  v = visual mode        ',
        '  i = inner selection    ',
        '  w = word (floor item)  ',
        '  ( { [ = bracket type   ',
        '  y = yank the contents  ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [],
  barrels: [],
  containers: [
    {
      id: 'barrel1',
      pos: { x: 49, y: 23 },
      char: 'O',
      openChar: 'o',
      bracketType: '(',
      item: keyItemAt('health_potion', { x: 49, y: 23 }),
      opened: false,
    },
    {
      id: 'chest1',
      pos: { x: 94, y: 23 },
      char: 'X',
      openChar: 'x',
      bracketType: '[',
      item: keyItemAt('silver_key', { x: 94, y: 23 }),
      opened: false,
    },
  ],
  hintText: 'Stand next to a barrel (?), chest {?}, or locker [?] and use vi(y, vi{y, or vi[y.',
  hintDelay: 10000,
};

export const tutorialLevel3: RoomTemplate = {
  name: 'Tutorial: First Blood',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutLevel3(),
  doors: [
    {
      pos: { x: 0, y: 16 },
      open: false,
      gateCondition: 'all_enemies_dead',
      targetLevel: 4,
      chars: ['_', '_', '_', '_'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 6 },
      text: [
        '  COMBAT BASICS          ',
        '',
        '  A goblin lurks nearby! ',
        '  Pick up the ~ Sling,   ',
        '  then use :equip sling  ',
        '  or press e in :inv     ',
        '',
        '  x = melee strike       ',
        '    (hits in your facing ',
        '     direction)          ',
        '',
        '  d = ranged attack      ',
        '    (fires equipped      ',
        '     weapon projectile)  ',
        '',
        '  Defeat all enemies to  ',
        '  open the west door.    ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [keyItemAt('sling', { x: 41, y: 16 })],
  enemies: [createEnemy('goblin_grunt', 'goblin1', { x: 105, y: 16 })],
  barrels: [],
  containers: [],
  hintText: 'Pick up the ~ Sling (vy), equip it (:equip sling), then use d to shoot!',
  hintDelay: 8000,
};

export const tutorialLevel4: RoomTemplate = {
  name: 'Tutorial: Dodge & Cover',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutLevel4(),
  doors: [
    {
      pos: { x: 11, y: ROOM_H - 1 },
      open: false,
      gateCondition: 'all_enemies_dead',
      targetLevel: 5,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 6 },
      text: [
        '  DODGE & COVER          ',
        '',
        '  This enemy shoots!     ',
        '  Open the barrel (?)    ',
        '  nearby for a crossbow. ',
        '',
        '  % = dodge to matching  ',
        '    bracket pair (){}    ',
        '',
        '  Ctrl-d = roll down 5   ',
        '  Ctrl-u = roll up 5     ',
        '',
        '  Barrels explode when   ',
        '  hit -- watch out!      ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [createEnemy('slime', 'slime1', { x: 105, y: 16 })],
  barrels: [
    { pos: { x: 53, y: 14 }, destroyed: false, explosionFrame: -1 },
    { pos: { x: 71, y: 14 }, destroyed: false, explosionFrame: -1 },
  ],
  containers: [
    {
      id: 'crossbow_barrel',
      pos: { x: 36, y: 18 },
      char: 'O',
      openChar: 'o',
      bracketType: '(',
      item: keyItemAt('crossbow', { x: 36, y: 18 }),
      opened: false,
    },
  ],
  hintText: 'Use % to dodge between brackets, d to shoot, vi(y to open barrels!',
  hintDelay: 8000,
};

export const tutorialComplete: RoomTemplate = {
  name: 'Tutorial Complete!',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutComplete(),
  doors: [
    {
      pos: { x: ROOM_W - 2, y: 15 },
      open: false,
      gateCondition: 'reach',
      targetLevel: 6,
      chars: ['_', '_', '_', '_'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 12 },
      text: [
        '  TUTORIAL COMPLETE!     ',
        '',
        '  You have learned:      ',
        '  - h/j/k/l movement    ',
        '  - i INSERT (move only) ',
        '  - v + y / viw + y      ',
        '  - vi(y / vi{y / vi[y   ',
        '  - x melee, d ranged   ',
        '  - gg consumables       ',
        '  - % dodge, Ctrl-d/u   ',
        '  - : commands           ',
        '  - :equip / :inv (e)   ',
        '  - p paste (drop) item  ',
        '',
        '  One more lesson — take ',
        '  the east exit…         ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'Walk east through the door to the help scroll room, or read the [?] sign.',
  hintDelay: 5000,
};

export const tutorialLevelHelp: RoomTemplate = {
  name: 'Tutorial: The Help Scroll',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutHelp(),
  doors: [
    {
      pos: { x: Math.floor((ROOM_W - 2) / 2), y: ROOM_H - 1 },
      open: false,
      gateCondition: 'help_then_reach',
      targetLevel: 7,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 10 },
      text: [
        '  THE HELP SCROLL        ',
        '',
        '  The door stays sealed   ',
        '  until you open :help   ',
        '  once from NORMAL mode:  ',
        '',
        '    : help   Enter       ',
        '',
        '  Inside :help use j/k   ',
        '  and Enter to browse.   ',
        '  :q closes the manual.  ',
        '',
        '  Then walk south again; ',
        '  Act 1 begins — combat   ',
        '  and an optional vault.  ',
        '',
        '  Beyond that lies the    ',
        '  procedural Vimgeon.     ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'Type :help once, then return to the south door.',
  hintDelay: 6000,
};

export const tutorialLevels: RoomTemplate[] = [
  tutorialLevel0,
  tutorialLevel1,
  tutorialLevel2,
  tutorialLevel3,
  tutorialLevel4,
  tutorialComplete,
  tutorialLevelHelp,
];
