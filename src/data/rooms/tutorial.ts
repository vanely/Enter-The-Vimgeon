import type { RoomTemplate } from '../../engine/types';
import { createEnemy } from '../enemies';
import { keyItemAt } from '../items';

const ROOM_W = 42;
const ROOM_H = 16;

export { ROOM_W, ROOM_H };

function padLine(line: string, width: number): string {
  return line.padEnd(width).slice(0, width);
}

export function makeLayout(lines: string[], width: number, height: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < height; i++) {
    result.push(padLine(lines[i] || '', width));
  }
  return result;
}

export const tutorialLevel0: RoomTemplate = {
  name: 'Tutorial: Awakening',
  width: ROOM_W,
  height: ROOM_H,
  layout: makeLayout([
    '+----------------------------------------+',
    '|........................................|',
    '|..*...............................*.....|',
    '|..[?].................................*.|',
    '|........................................|',
    '|........................................|',
    '|....@...................................|',
    '|........................................|',
    '|..*.....................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|..*...............................*.....|',
    '|........................................|',
    '+-------------------||-------------------+',
    '                                          ',
  ], ROOM_W, ROOM_H),
  doors: [
    {
      pos: { x: 20, y: 14 },
      open: false,
      gateCondition: 'reach',
      targetLevel: 1,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 3, y: 3 },
      text: [
        '  USE h/j/k/l TO MOVE   ',
        '',
        '  h = left   l = right   ',
        '  k = up     j = down    ',
        '',
        '  Navigate to the door   ',
        '  at the bottom to       ',
        '  continue.              ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'Try pressing h, j, k, or l to move around.',
  hintDelay: 8000,
};

export const tutorialLevel1: RoomTemplate = {
  name: 'Tutorial: The Locked Door',
  width: ROOM_W,
  height: ROOM_H,
  layout: makeLayout([
    '+----------------------------------------+',
    '|........................................|',
    '|..*.....................................|',
    '|....[?].................................|',
    '|........................................|',
    '|........................................|',
    '|..@.....................................|',
    '|........................................|',
    '|..*.....................................|',
    '|..............LOCKED....................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|..*...............................*.....|',
    '+-------------------||-------------------+',
    '                                          ',
  ], ROOM_W, ROOM_H),
  doors: [
    {
      pos: { x: 20, y: 14 },
      open: false,
      gateCondition: 'command_open',
      requiredKey: 'iron_key',
      targetLevel: 2,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 5, y: 3 },
      text: [
        '  THE DOOR IS LOCKED!    ',
        '',
        '  Find the & key in this ',
        '  room. Stand on it,     ',
        '  press v then y to      ',
        '  pick it up. Then       ',
        '  use :open at the door. ',
        '',
        '  Press Esc to return    ',
        '  to NORMAL mode.        ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [
    keyItemAt('iron_key', { x: 30, y: 10 }),
  ],
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
  layout: makeLayout([
    '+----------------------------------------+',
    '|........................................|',
    '|..[?]...................................|',
    '|........................................|',
    '|........................................|',
    '|..@.....................................|',
    '|........................................|',
    '|..*.....................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '+-------------------||-------------------+',
    '                                          ',
  ], ROOM_W, ROOM_H),
  doors: [
    {
      pos: { x: 20, y: 14 },
      open: false,
      gateCondition: 'reach',
      targetLevel: 3,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 3, y: 2 },
      text: [
        '  CONTAINERS             ',
        '',
        '  Barrels (?) and chests ',
        '  {?} hold valuable items',
        '',
        '  Stand next to one and  ',
        '  use vi(y for barrels   ',
        '  or vi{y for chests.    ',
        '',
        '  v = visual mode        ',
        '  i = inner selection    ',
        '  ( or { = bracket type  ',
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
      pos: { x: 20, y: 7 },
      char: 'O',
      openChar: 'o',
      bracketType: '(',
      item: keyItemAt('health_potion', { x: 20, y: 7 }),
      opened: false,
    },
    {
      id: 'chest1',
      pos: { x: 30, y: 7 },
      char: 'X',
      openChar: 'x',
      bracketType: '{',
      item: keyItemAt('silver_key', { x: 30, y: 7 }),
      opened: false,
    },
  ],
  hintText: 'Stand next to a barrel (?) or chest {?} and use vi(y or vi{y.',
  hintDelay: 10000,
};

export const tutorialLevel3: RoomTemplate = {
  name: 'Tutorial: First Blood',
  width: ROOM_W,
  height: ROOM_H,
  layout: makeLayout([
    '+----------------------------------------+',
    '|........................................|',
    '|..[?]...................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|..@.....................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '+-------------------||-------------------+',
    '                                          ',
  ], ROOM_W, ROOM_H),
  doors: [
    {
      pos: { x: 20, y: 14 },
      open: false,
      gateCondition: 'all_enemies_dead',
      targetLevel: 4,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 3, y: 2 },
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
        '  open the door.         ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [
    keyItemAt('sling', { x: 10, y: 6 }),
  ],
  enemies: [
    createEnemy('goblin_grunt', 'goblin1', { x: 30, y: 7 }),
  ],
  barrels: [],
  containers: [],
  hintText: 'Pick up the ~ Sling (vy), equip it (:equip sling), then use d to shoot!',
  hintDelay: 8000,
};

export const tutorialLevel4: RoomTemplate = {
  name: 'Tutorial: Dodge & Cover',
  width: ROOM_W,
  height: ROOM_H,
  layout: makeLayout([
    '+----------------------------------------+',
    '|........................................|',
    '|..[?]...................................|',
    '|........................................|',
    '|.......(.........................)......|',
    '|........................................|',
    '|..@.....................................|',
    '|........................................|',
    '|........................................|',
    '|.......(.........................)......|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '+-------------------||-------------------+',
    '                                          ',
  ], ROOM_W, ROOM_H),
  doors: [
    {
      pos: { x: 20, y: 14 },
      open: false,
      gateCondition: 'all_enemies_dead',
      targetLevel: 5,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 3, y: 2 },
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
  enemies: [
    createEnemy('slime', 'slime1', { x: 35, y: 7 }),
  ],
  barrels: [
    { pos: { x: 20, y: 5 }, destroyed: false, explosionFrame: -1 },
    { pos: { x: 20, y: 9 }, destroyed: false, explosionFrame: -1 },
  ],
  containers: [
    {
      id: 'crossbow_barrel',
      pos: { x: 10, y: 8 },
      char: 'O',
      openChar: 'o',
      bracketType: '(',
      item: keyItemAt('crossbow', { x: 10, y: 8 }),
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
  layout: makeLayout([
    '+----------------------------------------+',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|..*.....................................|',
    '|........................................|',
    '|..[?]...................................|',
    '|........................................|',
    '|..@.....................................|',
    '|........................................|',
    '|..*.....................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '+-------------------||-------------------+',
    '                                          ',
  ], ROOM_W, ROOM_H),
  doors: [
    {
      pos: { x: 20, y: 14 },
      open: false,
      gateCondition: 'reach',
      targetLevel: 6,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 3, y: 6 },
      text: [
        '  TUTORIAL COMPLETE!     ',
        '',
        '  You have learned:      ',
        '  - h/j/k/l movement    ',
        '  - v + y to pick items  ',
        '  - vi(y / vi{y          ',
        '    container pickups    ',
        '  - x melee, d ranged   ',
        '  - gg consumables       ',
        '  - % dodge, Ctrl-d/u   ',
        '  - : commands           ',
        '  - :equip / :inv (e)   ',
        '  - p paste (drop) item  ',
        '',
        '  The dungeon awaits...  ',
        '  (end of current build) ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'Walk to the [?] sign to see your progress.',
  hintDelay: 5000,
};

export const tutorialLevels: RoomTemplate[] = [
  tutorialLevel0,
  tutorialLevel1,
  tutorialLevel2,
  tutorialLevel3,
  tutorialLevel4,
  tutorialComplete,
];
