import type { RoomTemplate } from '../../engine/types';
import { makeLayout, ROOM_H, ROOM_W } from './tutorial';
import { keyItemAt } from '../items';

/*
 * Story / puzzle rooms — not part of the combat tutorial track.
 * When the narrative is ready, import levels from here and register them in initTutorialLevels
 * (or a dedicated story loader); do not merge this file into the tutorial by default.
 */

export const puzzlePrismaticVault: RoomTemplate = {
  name: 'Puzzle: Prismatic Vault',
  width: ROOM_W,
  height: ROOM_H,
  layout: makeLayout([
    '+----------------------------------------+',
    '|........................................|',
    '|..[?]...................................|',
    '|........................................|',
    '|...........................\\............|',
    '|........................................|',
    '|.............\\.......\'.........R........|',
    '|........................................|',
    '|..@..S......./.........................\\|',
    '|............................####----####|',
    '|..................................*.....|',
    '|........................................|',
    '|........................................|',
    '|........................................|',
    '+-------------------||-------------------+',
    '                                          ',
  ], ROOM_W, ROOM_H),
  doors: [
    {
      pos: { x: 33, y: 9 },
      open: false,
      gateCondition: 'light_puzzle',
      chars: ['-', '-', '-', '-'],
    },
    {
      pos: { x: 20, y: 14 },
      open: false,
      gateCondition: 'reach',
      targetLevel: 5,
      chars: ['|', '|'],
    },
  ],
  signs: [
    {
      pos: { x: 3, y: 2 },
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
  keys: [keyItemAt('fire_wand', { x: 35, y: 10 })],
  enemies: [],
  barrels: [],
  containers: [],
  hintText: 'Let the beam strike R; then claim the wand and exit south.',
  hintDelay: 9000,
  lightPuzzle: {
    source: { x: 6, y: 8 },
    sourceDir: { dx: 1, dy: 0 },
    receptor: { x: 32, y: 6 },
  },
};

/** Reserved for story progression; not loaded until wired in App or a future narrative layer. */
export const puzzleLevels: RoomTemplate[] = [
  puzzlePrismaticVault,
];
