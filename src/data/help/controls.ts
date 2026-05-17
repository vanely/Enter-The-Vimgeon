export interface HelpPage {
  title: string;
  lines: string[];
}

export const helpMainMenu: HelpPage = {
  title: ':help - THE VIMGEON GUIDE',
  lines: [
    '',
    '  GETTING STARTED',
    '',
    '  > [Controls]         Movement, modes, basic commands',
    '    [Combat]           Shooting, melee, dodging',
    '    [Items]            Picking up, inventory, containers',
    '    [Spells]           Command-mode abilities',
    '    [Map]              Dungeon navigation, minimap',
    '    [Bestiary]         Enemies you have encountered',
    '    [Lore]             Story and world lore',
    '',
    '  Navigate with j/k, select with Enter, back with Esc',
    '  Close help with :q',
    '',
  ],
};

export const helpControls: HelpPage = {
  title: 'CONTROLS',
  lines: [
    '',
    '  MOVEMENT (NORMAL mode)',
    '    h .... move left        j .... move down',
    '    k .... move up          l .... move right',
    '    w .... next landmark    b .... prev landmark    [Locked]',
    '    0 .... left wall        $ .... right wall       [Locked]',
    '',
    '  MODES',
    '    Esc .. NORMAL mode      i .... INSERT mode      [Locked]',
    '    v .... VISUAL mode      : .... COMMAND mode',
    '',
    '  COMBAT',
    '    x .... melee strike (facing direction)',
    '    d .... ranged attack (equipped weapon)',
    '    % .... dodge to matching bracket pair',
    '    Ctrl-d dodge roll down   Ctrl-u dodge roll up',
    '',
    '  COMMANDS',
    '    :open ...... open a locked door',
    '    :equip ..... equip a weapon (:equip sling)',
    '    :help ...... open this help menu',
    '    :inv ....... open inventory',
    '    :q ......... close help / quit menu',
    '    :retry ..... restart current level',
    '',
    '  Press Esc to go back',
    '',
  ],
};

export const helpCombat: HelpPage = {
  title: 'COMBAT',
  lines: [
    '',
    '  MELEE',
    '    x ........ strike in facing direction (2 dmg)',
    '    Your direction is set by h/j/k/l movement',
    '',
    '  RANGED',
    '    d ........ fire equipped weapon in facing dir',
    '    Requires a weapon to be equipped (:equip)',
    '    Ammo weapons consume shots when fired',
    '    Cooldown weapons must recharge between shots',
    '',
    '  WEAPONS',
    '    ~ Sling ..... 1 dmg, 10 ammo (projectile: o)',
    '    T Crossbow .. 2 dmg, 5 ammo  (projectile: +)',
    '    / Fire Wand . 1 dmg, cooldown (projectile: *)',
    '',
    '  DODGE',
    '    % ........ teleport to matching bracket pair',
    '               ()  {}',
    '    Ctrl-d ... dodge roll 5 cells down',
    '    Ctrl-u ... dodge roll 5 cells up',
    '',
    '  BARRELS',
    '    O ........ barrel -- explodes when hit (3 dmg)',
    '               damages all within 2 cells',
    '',
    '  DEATH',
    '    :retry ... restart current level',
    '',
    '  Press Esc to go back',
    '',
  ],
};

export const helpItems: HelpPage = {
  title: 'ITEMS',
  lines: [
    '',
    '  PICKING UP ITEMS',
    '    Stand on an item and use:',
    '    v .... enter VISUAL mode (select the item)',
    '    y .... yank (pick up) the selected item',
    '',
    '  KEYS',
    '    & .... key item -- used to unlock doors',
    '    Stand on a key, press v then y to collect',
    '    Then use :open at a locked door',
    '',
    '  CONTAINERS',
    '    vi(y . yank from barrel  (?)',
    '    vi{y . yank from chest   {?}',
    '',
    '  WEAPONS',
    '    Pick up a weapon and use :equip <name>',
    '    Or press e on a weapon in :inv to equip',
    '    Press d to fire the equipped weapon',
    '',
    '  INVENTORY',
    '    :inv ....... open full inventory',
    '    e .......... equip selected weapon',
    '    1-3 ........ assign item to quick slot',
    '    Collected items appear in the status bar',
    '    Keys are consumed when you unlock a door',
    '',
    '  Press Esc to go back',
    '',
  ],
};

export const helpSpells: HelpPage = {
  title: 'SPELLS',
  lines: [
    '',
    '  Spells have not been unlocked yet.',
    '',
    '  You will learn to cast spells using',
    '  COMMAND mode later in the dungeon.',
    '',
    '  Press Esc to go back',
    '',
  ],
};

export const helpMap: HelpPage = {
  title: 'MAP',
  lines: [
    '',
    '  The minimap has not been unlocked yet.',
    '',
    '  As you explore more of the dungeon,',
    '  you will gain a map of explored rooms.',
    '',
    '  Press Esc to go back',
    '',
  ],
};

export const helpBestiary: HelpPage = {
  title: 'BESTIARY',
  lines: [
    '',
    '  No enemies encountered yet.',
    '',
    '  Enemies you defeat will appear here',
    '  with their patterns and weaknesses.',
    '',
    '  Press Esc to go back',
    '',
  ],
};

export const helpLore: HelpPage = {
  title: 'LORE',
  lines: [
    '',
    '  You awaken in a strange dungeon.',
    '  The walls pulse with text...',
    '',
    '  Collect lore fragments from signs,',
    '  NPCs, and books as you explore.',
    '',
    '  Press Esc to go back',
    '',
  ],
};

export const helpPages: Record<string, HelpPage> = {
  main: helpMainMenu,
  controls: helpControls,
  combat: helpCombat,
  items: helpItems,
  spells: helpSpells,
  map: helpMap,
  bestiary: helpBestiary,
  lore: helpLore,
};

export const helpSections = ['controls', 'combat', 'items', 'spells', 'map', 'bestiary', 'lore'];
