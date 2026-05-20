import type { RoomTemplate } from '../../engine/types';
import {
  hollowRoom,
  makeLayout,
  ROOM_H,
  ROOM_W,
  setCell,
  setCells,
  setFloorRow,
} from './tutorial';
import { keyItemAt } from '../items';

/*
 * Story / puzzle rooms. `puzzlePrismaticVault` is listed in `act1Levels` in `act1.ts`;
 * its south door `targetLevel` must stay aligned with `ACT1_INDEX.mainShaft` in `act1.ts`.
 */

function layoutPrismaticVault(): string[] {
  const rows = hollowRoom([
    { side: 'north', x: 82, chars: ['|', '|'] },
    { side: 'south', x: 63, chars: ['|', '|'] },
  ]);
  for (let yy = 4; yy <= 21; yy++) {
    if (yy === 11 || yy === 12) continue;
    setCell(rows, 64, yy, '#');
  }
  setCells(rows, [
    { x: 15, y: 5, ch: '[' }, { x: 16, y: 5, ch: '?' }, { x: 17, y: 5, ch: ']' },
    { x: 18, y: 6, ch: '@' },
    { x: 92, y: 14, ch: 'S' },
    { x: 110, y: 10, ch: 'R' },
    { x: 75, y: 6, ch: '\\' },
    { x: 66, y: 12, ch: '\\' },
    { x: 79, y: 12, ch: '\'' },
    { x: 69, y: 14, ch: '/' },
    { x: 115, y: 14, ch: '\\' },
  ]);
  setFloorRow(
    rows,
    16,
    `${'.'.repeat(58)}####${'----'.repeat(4)}####${'.'.repeat(44)}`,
  );
  return makeLayout(rows, ROOM_W, ROOM_H);
}

export const puzzlePrismaticVault: RoomTemplate = {
  name: 'Puzzle: Prismatic Vault',
  width: ROOM_W,
  height: ROOM_H,
  layout: layoutPrismaticVault(),
  doors: [
    {
      pos: { x: 82, y: 0 },
      open: false,
      gateCondition: 'light_puzzle',
      chars: ['|', '|'],
    },
    {
      pos: { x: 63, y: ROOM_H - 1 },
      open: false,
      gateCondition: 'reach',
      targetLevel: 10,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 15, y: 5 },
      text: [
        '  PRISM VAULT            ',
        '',
        '  Light from S travels   ',
        '  one cell per tick like ',
        '  a projectile.          ',
        '  / and \\ redirect it.   ',
        "  ' = light-only slit.   ",
        '  R = sensor — hit it to ',
        '  open the vault door.   ',
        '',
        '  A decoy \\ sits in the  ',
        '  upper hall (wrong row).',
        '',
        '  (press any key to close)',
      ],
    },
  ],
  keys: [keyItemAt('fire_wand', { x: 92, y: 20 })],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'Let the beam strike R; then claim the wand and exit south.',
  hintDelay: 9000,
  lightPuzzle: {
    source: { x: 92, y: 14 },
    sourceDir: { dx: 1, dy: 0 },
    receptor: { x: 110, y: 10 },
  },
};

/** Reserved for story progression; not loaded until wired in App or a future narrative layer. */
export const puzzleLevels: RoomTemplate[] = [
  puzzlePrismaticVault,
];
