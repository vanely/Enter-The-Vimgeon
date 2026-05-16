import type { RoomTemplate } from '../../engine/types';

const ROOM_W = 42;
const ROOM_H = 16;

function padLine(line: string, width: number): string {
  return line.padEnd(width).slice(0, width);
}

function makeLayout(lines: string[], width: number, height: number): string[] {
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
    {
      id: 'iron_key',
      name: 'Iron Key',
      pos: { x: 30, y: 10 },
      char: '&',
      collected: false,
    },
  ],
  hintText: 'Find the & key, stand on it, press v then y to pick it up.',
  hintDelay: 10000,
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
    '+----------------------------------------+',
  ], ROOM_W, ROOM_H),
  doors: [],
  signs: [
    {
      pos: { x: 3, y: 6 },
      text: [
        '  TUTORIAL COMPLETE!     ',
        '',
        '  You have learned:      ',
        '  - h/j/k/l movement    ',
        '  - v + y to pick items  ',
        '  - : for commands       ',
        '  - :open to use keys    ',
        '  - :help for guidance   ',
        '',
        '  The dungeon awaits...  ',
        '  (end of current build) ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  hintText: 'Walk to the [?] sign to see your progress.',
  hintDelay: 5000,
};

export const tutorialLevels: RoomTemplate[] = [
  tutorialLevel0,
  tutorialLevel1,
  tutorialComplete,
];
