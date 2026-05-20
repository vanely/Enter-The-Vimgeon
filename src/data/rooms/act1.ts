import type { RoomTemplate } from '../../engine/types';
import { createEnemy } from '../enemies';
import { hollowRoom, makeLayout, ROOM_W, ROOM_H, setCells, setFloorRow, padLine } from './tutorial';
import { puzzlePrismaticVault } from './puzzles';

/**
 * Post-tutorial authored segment (combat + optional Prismatic Vault), then procedural dungeon.
 * Full graph: tutorial indices 0–6, then Act 1 below. Keep in sync with `brainstorming/act1-vault-branch-tickets.md`.
 */
export const ACT1_INDEX = {
  threshold: 7,
  fork: 8,
  prismaticVault: 9,
  mainShaft: 10,
  terminus: 11,
} as const;

const IW = ROOM_W - 2;

function layoutAct1Threshold(): string[] {
  const rows = hollowRoom([{ side: 'south', x: Math.floor((ROOM_W - 2) / 2), chars: ['|', '|'] }]);
  setCells(rows, [
    { x: 15, y: 6, ch: '[' }, { x: 16, y: 6, ch: '?' }, { x: 17, y: 6, ch: ']' },
    { x: 62, y: 20, ch: '@' },
    { x: 38, y: 14, ch: '*' }, { x: 90, y: 14, ch: '*' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

export const act1Threshold: RoomTemplate = {
  name: 'Act 1: The Threshold',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutAct1Threshold(),
  doors: [
    {
      pos: { x: Math.floor((ROOM_W - 2) / 2), y: ROOM_H - 1 },
      open: false,
      gateCondition: 'reach',
      targetLevel: ACT1_INDEX.fork,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 6 },
      text: [
        '  THE THRESHOLD          ',
        '',
        '  Tutorial done — this   ',
        '  shaft is real.        ',
        '',
        '  South: onward.        ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [createEnemy('goblin_grunt', 'a1-g1', { x: 85, y: 12 })],
  barrels: [],
  containers: [],
  hintText: 'Clear the goblin or slip past — then head south.',
  hintDelay: 7000,
};

function layoutAct1Fork(): string[] {
  const rows = hollowRoom([
    { side: 'south', x: Math.floor((ROOM_W - 2) / 2), chars: ['|', '|'] },
    { side: 'east', y: 16, chars: ['_', '_', '_', '_'] },
  ]);
  setCells(rows, [
    { x: 15, y: 6, ch: '[' }, { x: 16, y: 6, ch: '?' }, { x: 17, y: 6, ch: ']' },
    { x: 62, y: 20, ch: '@' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

export const act1Fork: RoomTemplate = {
  name: 'Act 1: Fork in the Shaft',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutAct1Fork(),
  doors: [
    {
      pos: { x: ROOM_W - 2, y: 16 },
      open: false,
      gateCondition: 'reach',
      targetLevel: ACT1_INDEX.prismaticVault,
      chars: ['_', '_', '_', '_'],
    },
    {
      pos: { x: Math.floor((ROOM_W - 2) / 2), y: ROOM_H - 1 },
      open: false,
      gateCondition: 'reach',
      targetLevel: ACT1_INDEX.mainShaft,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 6 },
      text: [
        '  A FORK                 ',
        '',
        '  South — the main shaft ',
        '  (combat ahead).        ',
        '',
        '  East — side passage;  ',
        '  refracted light seals ',
        '  a vault (optional).   ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'South for the main path; east for the Prismatic Vault side room.',
  hintDelay: 8000,
};

function layoutAct1MainShaft(): string[] {
  const rows = hollowRoom([{ side: 'south', x: Math.floor((ROOM_W - 2) / 2), chars: ['|', '|'] }]);
  const widePair = `${'.'.repeat(6)}(${'.'.repeat(54)})${'.'.repeat(6)}`;
  setFloorRow(rows, 10, padLine(widePair, IW));
  setCells(rows, [
    { x: 15, y: 6, ch: '[' }, { x: 16, y: 6, ch: '?' }, { x: 17, y: 6, ch: ']' },
    { x: 62, y: 22, ch: '@' },
    { x: 28, y: 15, ch: '(' }, { x: 29, y: 15, ch: '.' }, { x: 30, y: 15, ch: ')' },
    { x: 96, y: 15, ch: '(' }, { x: 97, y: 15, ch: '.' }, { x: 98, y: 15, ch: ')' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

export const act1MainShaft: RoomTemplate = {
  name: 'Act 1: Main Shaft',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutAct1MainShaft(),
  doors: [
    {
      pos: { x: Math.floor((ROOM_W - 2) / 2), y: ROOM_H - 1 },
      open: false,
      gateCondition: 'reach',
      targetLevel: ACT1_INDEX.terminus,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 6 },
      text: [
        '  MAIN SHAFT            ',
        '',
        '  Use cover. Clear the   ',
        '  room — then south to   ',
        '  the descent.           ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [
    createEnemy('slime', 'a1-s1', { x: 38, y: 16 }),
    createEnemy('dart_imp', 'a1-i1', { x: 94, y: 18 }),
  ],
  barrels: [],
  containers: [],
  hintText: 'Slime and imp ahead — dodge brackets, use ranged or melee.',
  hintDelay: 7000,
};

function layoutAct1Terminus(): string[] {
  const rows = hollowRoom([{ side: 'south', x: Math.floor((ROOM_W - 2) / 2), chars: ['|', '|'] }]);
  setCells(rows, [
    { x: 15, y: 6, ch: '[' }, { x: 16, y: 6, ch: '?' }, { x: 17, y: 6, ch: ']' },
    { x: 62, y: 20, ch: '@' },
  ]);
  return makeLayout(rows, ROOM_W, ROOM_H);
}

export const act1Terminus: RoomTemplate = {
  name: 'Act 1: Descent',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutAct1Terminus(),
  doors: [
    {
      pos: { x: Math.floor((ROOM_W - 2) / 2), y: ROOM_H - 1 },
      open: false,
      gateCondition: 'reach',
      startDungeonRun: true,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 6 },
      text: [
        '  DESCENT               ',
        '',
        '  The hand-hewn shaft   ',
        '  ends here. Beyond the ',
        '  door lies the Vimgeon —',
        '  shifting halls (each  ',
        '  run is new).          ',
        '',
        '  South: enter the run. ',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'When ready, step through the south door to begin the procedural dungeon.',
  hintDelay: 8000,
};

/** Ordered Act 1 segment (append after `tutorialLevels` in `App.tsx`). */
export const act1Levels: RoomTemplate[] = [
  act1Threshold,
  act1Fork,
  puzzlePrismaticVault,
  act1MainShaft,
  act1Terminus,
];
