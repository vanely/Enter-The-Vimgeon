import { create } from 'zustand';
import { createCell } from '../utils/ascii';
import type { Cell } from '../utils/ascii';
import { COLORS } from '../utils/colors';
import type { VimMode, Position, Door, Sign, KeyItem, RoomTemplate, Message, GameState, Projectile, Enemy, Barrel, Container, InventoryItem, Weapon } from './types';
import type { EnemyAI } from './types';
import { WEAPONS } from '../data/weapons';

export type { VimMode, Position, Door, Sign, KeyItem, RoomTemplate, Message, GameState, Projectile, Enemy, Barrel, Container, InventoryItem, Weapon, EnemyAI };

function lookupWeapon(itemId: string): Weapon | undefined {
  return WEAPONS[itemId];
}

function doorKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function isSignChar(char: string): boolean {
  return char === '[' || char === '?' || char === ']';
}

function isBracketChar(char: string): boolean {
  return char === '(' || char === ')' || char === '{' || char === '}';
}

function isWalkable(char: string): boolean {
  if (char === '.' || char === ' ' || char === '@' || isSignChar(char) || isBracketChar(char)) return true;
  if (char >= 'A' && char <= 'Z') return true;
  if (char >= 'a' && char <= 'z') return true;
  return false;
}

function isDoorChar(char: string): boolean {
  return char === '|' || char === '-';
}

function buildGrid(room: RoomTemplate, _playerPos: Position, doorStates: Map<string, boolean>): Cell[][] {
  const grid: Cell[][] = [];

  for (let y = 0; y < room.height; y++) {
    const row: Cell[] = [];
    const line = room.layout[y] || '';
    for (let x = 0; x < room.width; x++) {
      const char = line[x] || ' ';
      let cell: Cell;

      switch (char) {
        case '#':
        case '+':
          cell = createCell(char, COLORS.wall, undefined, true);
          break;
        case '.':
          cell = createCell('.', COLORS.floor);
          break;
        case ' ':
          cell = createCell(' ');
          break;
        case '@':
          cell = createCell('.', COLORS.floor);
          break;
        case '|':
        case '-': {
          const dk = doorKey({ x, y });
          const isDoor = doorStates.has(dk);
          if (isDoor) {
            const doorOpen = doorStates.get(dk)!;
            if (doorOpen) {
              cell = createCell('.', COLORS.doorOpen);
            } else {
              cell = createCell(char, COLORS.door, undefined, true);
            }
          } else {
            cell = createCell(char, COLORS.wall, undefined, true);
          }
          break;
        }
        case '[':
        case ']':
        case '?':
          cell = createCell(char, COLORS.sign, undefined, true);
          break;
        case '*':
          cell = createCell(char, COLORS.accent);
          break;
        case '(':
        case ')':
        case '{':
        case '}':
          cell = createCell(char, COLORS.modeVisual);
          break;
        default:
          cell = createCell(char, COLORS.text);
          break;
      }

      row.push(cell);
    }
    grid.push(row);
  }

  for (const key of room.keys) {
    if (!key.collected && key.pos.y < grid.length && key.pos.x < grid[0].length) {
      grid[key.pos.y][key.pos.x] = createCell(key.char, COLORS.keyItem, COLORS.keyItemBg, true);
    }
  }

  return grid;
}

function renderCombatEntities(
  grid: Cell[][],
  playerPos: Position,
  enemies: Enemy[],
  barrels: Barrel[],
  projectiles: Projectile[],
  playerInvincible: number,
  containers: Container[] = [],
): void {
  for (const container of containers) {
    const { x, y } = container.pos;
    if (y < 0 || y >= grid.length) continue;
    if (!container.opened) {
      const [lChar, rChar] = container.bracketType === '(' ? ['(', ')'] : ['{', '}'];
      if (x - 1 >= 0 && x - 1 < grid[0].length)
        grid[y][x - 1] = createCell(lChar, COLORS.barrel, undefined, true);
      if (x >= 0 && x < grid[0].length)
        grid[y][x] = createCell('?', COLORS.barrel, undefined, true);
      if (x + 1 >= 0 && x + 1 < grid[0].length)
        grid[y][x + 1] = createCell(rChar, COLORS.barrel, undefined, true);
    } else {
      if (x - 1 >= 0 && x - 1 < grid[0].length)
        grid[y][x - 1] = createCell('.', COLORS.floor, undefined, false);
      if (x >= 0 && x < grid[0].length)
        grid[y][x] = createCell('.', COLORS.floor, undefined, false);
      if (x + 1 >= 0 && x + 1 < grid[0].length)
        grid[y][x + 1] = createCell('.', COLORS.floor, undefined, false);
    }
  }

  for (const barrel of barrels) {
    const { x, y } = barrel.pos;
    if (y < 0 || y >= grid.length) continue;
    if (!barrel.destroyed) {
      if (x - 1 >= 0 && x - 1 < grid[0].length)
        grid[y][x - 1] = createCell('(', COLORS.barrel, undefined, true);
      if (x >= 0 && x < grid[0].length)
        grid[y][x] = createCell('O', COLORS.barrel, undefined, true);
      if (x + 1 >= 0 && x + 1 < grid[0].length)
        grid[y][x + 1] = createCell(')', COLORS.barrel, undefined, true);
    } else if (barrel.explosionFrame >= 0 && barrel.explosionFrame < 3) {
      const frames = ['X', '*', '.'];
      const explosionChar = frames[barrel.explosionFrame];
      if (x - 1 >= 0 && x - 1 < grid[0].length)
        grid[y][x - 1] = createCell(explosionChar, COLORS.explosion, COLORS.explosionBg, true);
      if (x >= 0 && x < grid[0].length)
        grid[y][x] = createCell(explosionChar, COLORS.explosion, COLORS.explosionBg, true);
      if (x + 1 >= 0 && x + 1 < grid[0].length)
        grid[y][x + 1] = createCell(explosionChar, COLORS.explosion, COLORS.explosionBg, true);
    }
  }

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const { x, y } = enemy.pos;
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) continue;
    grid[y][x] = createCell(enemy.chars[0], COLORS.enemy, COLORS.enemyBg, true);
  }

  for (const proj of projectiles) {
    const { x, y } = proj.pos;
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) continue;
    const color = proj.owner === 'player' ? COLORS.projectilePlayer : COLORS.projectileEnemy;
    grid[y][x] = createCell(proj.char, color, undefined, true);
  }

  if (playerPos.y >= 0 && playerPos.y < grid.length &&
      playerPos.x >= 0 && playerPos.x < grid[0].length) {
    const playerColor = playerInvincible > 0 ? COLORS.playerHurt : COLORS.player;
    grid[playerPos.y][playerPos.x] = createCell('@', playerColor, undefined, true);
  }
}

function buildFullGrid(
  room: RoomTemplate,
  playerPos: Position,
  doorStates: Map<string, boolean>,
  enemies: Enemy[] = [],
  barrels: Barrel[] = [],
  projectiles: Projectile[] = [],
  playerInvincible: number = 0,
  containers: Container[] = [],
): Cell[][] {
  const grid = buildGrid(room, playerPos, doorStates);
  renderCombatEntities(grid, playerPos, enemies, barrels, projectiles, playerInvincible, containers);
  return grid;
}

function storeGrid(room: RoomTemplate, playerPos: Position, doorStates: Map<string, boolean>, get: () => GameState): Cell[][] {
  const s = get();
  return buildFullGrid(room, playerPos, doorStates, s.enemies, s.barrels, s.projectiles, s.playerInvincible, s.containers);
}

function findPlayerStart(layout: string[]): Position {
  for (let y = 0; y < layout.length; y++) {
    const x = layout[y].indexOf('@');
    if (x !== -1) return { x, y };
  }
  return { x: 3, y: 3 };
}

function checkSignCollision(pos: Position, signs: Sign[], layout: string[]): Sign | null {
  const char = layout[pos.y]?.[pos.x];
  if (!char || !isSignChar(char)) return null;

  for (const sign of signs) {
    const dx = Math.abs(pos.x - sign.pos.x);
    const dy = Math.abs(pos.y - sign.pos.y);
    if (dy === 0 && dx <= 2) {
      return sign;
    }
  }
  return null;
}

function checkDoorCollision(pos: Position, doors: Door[]): Door | null {
  for (const door of doors) {
    for (let i = 0; i < door.chars.length; i++) {
      const dy = door.pos.y;
      const dx = door.pos.x + i;
      if (dx === pos.x && dy === pos.y) {
        return door;
      }
    }
  }
  return null;
}

let _tutorialLevels: RoomTemplate[] | null = null;

function getTutorialLevels(): RoomTemplate[] {
  if (!_tutorialLevels) {
    // Lazy import to break circular dependency
    throw new Error('Tutorial levels not initialized. Call initTutorialLevels first.');
  }
  return _tutorialLevels;
}

export function initTutorialLevels(levels: RoomTemplate[]): void {
  _tutorialLevels = levels;
}

export const useGameStore = create<GameState>((set, get) => ({
  mode: 'NORMAL',
  playerPos: { x: 0, y: 0 },
  playerHP: 10,
  playerMaxHP: 10,
  playerMP: 5,
  playerMaxMP: 5,
  currentLevel: 0,
  currentRoom: null,
  renderedGrid: [],
  messages: [],
  commandBuffer: '',
  helpOpen: false,
  helpSection: 'main',
  helpCursor: 0,
  signPopup: null,
  unlockedKeys: new Set(['h', 'j', 'k', 'l']),
  doorStates: new Map(),
  inventory: [],
  inventoryItems: [],
  inventoryOpen: false,
  inventoryCursor: 0,
  gameStarted: false,
  hintVisible: false,
  hintText: '',
  lastInputTime: Date.now(),
  nearbyItem: null,
  tutorialComplete: false,

  enemies: [],
  barrels: [],
  containers: [],
  projectiles: [],
  playerDir: { dx: 1, dy: 0 },
  lastShotDir: null,
  playerInvincible: 0,
  pendingKey: null,
  pendingVisualInner: null,
  playerDead: false,
  equippedWeaponId: null,
  weaponCooldown: 0,

  setMode: (mode) => set({ mode }),

  movePlayer: (dx, dy) => {
    const state = get();
    if (state.mode !== 'NORMAL' || state.helpOpen || state.signPopup || state.playerDead) return;

    set({ playerDir: { dx, dy } });

    const newX = state.playerPos.x + dx;
    const newY = state.playerPos.y + dy;
    const room = state.currentRoom;
    if (!room) return;

    if (newY < 0 || newY >= room.height || newX < 0 || newX >= room.width) return;

    const targetChar = room.layout[newY]?.[newX] || ' ';
    const dk = doorKey({ x: newX, y: newY });
    const isRegisteredDoor = state.doorStates.has(dk);
    const doorIsOpen = state.doorStates.get(dk) ?? false;

    if (isDoorChar(targetChar) && isRegisteredDoor) {
      const door = checkDoorCollision({ x: newX, y: newY }, room.doors);

      if (door && !door.open && door.gateCondition === 'reach') {
        const newDoorStates = new Map(state.doorStates);
        for (let i = 0; i < door.chars.length; i++) {
          newDoorStates.set(doorKey({ x: door.pos.x + i, y: door.pos.y }), true);
        }
        door.open = true;
        const newMessages = [...state.messages, {
          text: 'The door creaks open!',
          color: COLORS.doorOpen,
          timestamp: Date.now(),
        }];
        set({
          doorStates: newDoorStates,
          renderedGrid: storeGrid(room, state.playerPos, newDoorStates, get),
          messages: newMessages,
          lastInputTime: Date.now(),
          hintVisible: false,
        });
        return;
      }

      if (doorIsOpen) {
        if (door && door.targetLevel !== undefined) {
          set({ lastInputTime: Date.now(), hintVisible: false });
          get().loadLevel(door.targetLevel);
          return;
        }
        const newPos = { x: newX, y: newY };
        set({
          playerPos: newPos,
          renderedGrid: storeGrid(room, newPos, state.doorStates, get),
          signPopup: null,
          lastInputTime: Date.now(),
          hintVisible: false,
        });
        return;
      }

      return;
    }

    if (!isWalkable(targetChar)) {
      return;
    }

    const enemyBlocking = state.enemies.some((e) => !e.dead && e.pos.x === newX && e.pos.y === newY);
    if (enemyBlocking) return;

    const barrelBlocking = state.barrels.some((b) => !b.destroyed && b.pos.y === newY && newX >= b.pos.x - 1 && newX <= b.pos.x + 1);
    if (barrelBlocking) return;

    const containerBlocking = state.containers.some((c) => !c.opened && c.pos.y === newY && newX >= c.pos.x - 1 && newX <= c.pos.x + 1);
    if (containerBlocking) return;

    const newPos = { x: newX, y: newY };
    const sign = checkSignCollision(newPos, room.signs, room.layout);

    const itemHere = room.keys.find(
      (k) => !k.collected && k.pos.x === newPos.x && k.pos.y === newPos.y
    ) ?? null;

    set({
      playerPos: newPos,
      renderedGrid: storeGrid(room, newPos, state.doorStates, get),
      signPopup: sign ? sign.text : null,
      nearbyItem: itemHere,
      lastInputTime: Date.now(),
      hintVisible: false,
    });
  },

  yankItem: () => {
    const state = get();
    if (state.mode !== 'VISUAL') return;

    const room = state.currentRoom;
    if (!room || !state.nearbyItem) {
      get().addMessage('Nothing to yank here.', COLORS.textDim);
      set({ mode: 'NORMAL' });
      return;
    }

    const item = state.nearbyItem;
    item.collected = true;

    set({
      mode: 'NORMAL',
      nearbyItem: null,
      renderedGrid: storeGrid(room, state.playerPos, state.doorStates, get),
    });
    const weapon = lookupWeapon(item.id);
    get().addInventoryItem(item.id, item.name, item.char, weapon);
    get().addMessage(`Yanked: ${item.name}`, COLORS.keyItem);
  },

  setCurrentRoom: (room) => {
    const playerPos = findPlayerStart(room.layout);
    const doorStates = new Map<string, boolean>();
    for (const door of room.doors) {
      for (let i = 0; i < door.chars.length; i++) {
        doorStates.set(doorKey({ x: door.pos.x + i, y: door.pos.y }), door.open);
      }
    }
    set({
      currentRoom: room,
      playerPos,
      doorStates,
      renderedGrid: buildFullGrid(room, playerPos, doorStates),
      signPopup: null,
      hintVisible: false,
    });
  },

  loadLevel: (levelIndex) => {
    const levels = getTutorialLevels();
    const template = levels[levelIndex];
    if (!template) return;

    const level: RoomTemplate = {
      ...template,
      doors: template.doors.map((d) => ({ ...d, pos: { ...d.pos }, open: false })),
      signs: template.signs.map((s) => ({ ...s, pos: { ...s.pos }, text: [...s.text] })),
      keys: template.keys.map((k) => ({ ...k, pos: { ...k.pos }, collected: false })),
      enemies: template.enemies.map((e) => ({ ...e, pos: { ...e.pos }, dead: false, ticksSinceShot: 0, ticksSinceMove: 0 })),
      barrels: template.barrels.map((b) => ({ ...b, pos: { ...b.pos }, destroyed: false, explosionFrame: -1 })),
      containers: template.containers.map((c) => ({ ...c, pos: { ...c.pos }, item: { ...c.item, pos: { ...c.item.pos } }, opened: false })),
    };

    const playerPos = findPlayerStart(level.layout);
    const doorStates = new Map<string, boolean>();
    for (const door of level.doors) {
      for (let i = 0; i < door.chars.length; i++) {
        doorStates.set(doorKey({ x: door.pos.x + i, y: door.pos.y }), false);
      }
    }
    set({
      currentLevel: levelIndex,
      currentRoom: level,
      playerPos,
      doorStates,
      renderedGrid: buildFullGrid(level, playerPos, doorStates, level.enemies, level.barrels, [], 0, level.containers),
      signPopup: null,
      messages: [{
        text: `-- ${level.name} --`,
        color: COLORS.accent,
        timestamp: Date.now(),
      }],
      hintVisible: false,
      mode: 'NORMAL',
      commandBuffer: '',
      enemies: level.enemies.map((e) => ({ ...e })),
      barrels: level.barrels.map((b) => ({ ...b })),
      containers: level.containers.map((c) => ({ ...c })),
      projectiles: [],
      playerDir: { dx: 1, dy: 0 },
      lastShotDir: null,
      playerInvincible: 0,
      pendingKey: null,
      pendingVisualInner: null,
      playerDead: false,
      weaponCooldown: 0,
      playerHP: get().playerMaxHP,
    });
  },

  addMessage: (text, color) => set((s) => ({
    messages: [...s.messages.slice(-19), { text, color, timestamp: Date.now() }],
  })),

  setCommandBuffer: (cmd) => set({ commandBuffer: cmd }),

  executeCommand: (cmd) => {
    const state = get();
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === 'help') {
      set({
        helpOpen: true,
        helpSection: 'main',
        helpCursor: 0,
        mode: 'NORMAL',
        commandBuffer: '',
      });
      get().addMessage('Opening :help...', COLORS.signText);
      return;
    }

    if (trimmed === 'q') {
      if (state.helpOpen) {
        set({ helpOpen: false, helpSection: 'main', helpCursor: 0, commandBuffer: '', mode: 'NORMAL' });
        return;
      }
      set({ commandBuffer: '', mode: 'NORMAL' });
      get().addMessage('No buffer to close.', COLORS.textDim);
      return;
    }

    if (trimmed === 'open') {
      const room = state.currentRoom;
      if (!room) return;

      const closedDoor = room.doors.find((d) => !d.open && d.gateCondition === 'command_open');
      if (closedDoor) {
        if (closedDoor.requiredKey && !state.inventory.includes(closedDoor.requiredKey)) {
          get().addMessage('The door is locked. You need a key.', COLORS.hpFull);
          set({ commandBuffer: '', mode: 'NORMAL' });
          return;
        }

        const newDoorStates = new Map(state.doorStates);
        for (let i = 0; i < closedDoor.chars.length; i++) {
          newDoorStates.set(doorKey({ x: closedDoor.pos.x + i, y: closedDoor.pos.y }), true);
        }
        closedDoor.open = true;

        let newInventory = state.inventory;
        if (closedDoor.requiredKey) {
          newInventory = state.inventory.filter((k) => k !== closedDoor.requiredKey);
        }

        set({
          doorStates: newDoorStates,
          renderedGrid: storeGrid(room, state.playerPos, newDoorStates, get),
          commandBuffer: '',
          mode: 'NORMAL',
          inventory: newInventory,
        });
        get().addMessage('The door glows and swings open!', COLORS.doorOpen);
        if (!state.unlockedKeys.has(':')) {
          const newKeys = new Set(state.unlockedKeys);
          newKeys.add(':');
          newKeys.add('Esc');
          set({ unlockedKeys: newKeys });
        }
      } else {
        get().addMessage('There is no door to open here.', COLORS.textDim);
        set({ commandBuffer: '', mode: 'NORMAL' });
      }
      return;
    }

    if (trimmed === 'inv' || trimmed === 'inventory') {
      set({ inventoryOpen: true, inventoryCursor: 0, commandBuffer: '', mode: 'NORMAL' });
      get().addMessage('Opening inventory...', COLORS.signText);
      return;
    }

    if (trimmed.startsWith('equip')) {
      const weaponId = trimmed.replace('equip', '').trim();
      if (!weaponId) {
        get().addMessage('Usage: :equip <weapon_id>', COLORS.textDim);
        set({ commandBuffer: '', mode: 'NORMAL' });
        return;
      }
      const item = state.inventoryItems.find((i) => i.weapon && (i.weapon.id === weaponId || i.weapon.name.toLowerCase() === weaponId));
      if (!item || !item.weapon) {
        get().addMessage(`No weapon "${weaponId}" in inventory.`, COLORS.hpFull);
        set({ commandBuffer: '', mode: 'NORMAL' });
        return;
      }
      set({ equippedWeaponId: item.weapon.id, commandBuffer: '', mode: 'NORMAL' });
      get().addMessage(`Equipped: ${item.weapon.name}`, COLORS.keyItem);
      return;
    }

    if (trimmed === 'retry') {
      const level = state.currentLevel;
      set({ commandBuffer: '', mode: 'NORMAL' });
      get().loadLevel(level);
      get().addMessage('Restarting level...', COLORS.accent);
      return;
    }

    get().addMessage(`Unknown command: ${cmd}`, COLORS.hpFull);
    set({ commandBuffer: '', mode: 'NORMAL' });
  },

  toggleHelp: (section) => {
    const state = get();
    if (state.helpOpen) {
      set({ helpOpen: false, helpSection: 'main', helpCursor: 0 });
    } else {
      set({ helpOpen: true, helpSection: section || 'main', helpCursor: 0 });
    }
  },

  setHelpCursor: (cursor) => set({ helpCursor: cursor }),

  selectHelpSection: (section) => set({ helpSection: section, helpCursor: 0 }),

  dismissSign: () => set({ signPopup: null }),

  openDoor: (key) => set((s) => {
    const newDoorStates = new Map(s.doorStates);
    newDoorStates.set(key, true);
    const room = s.currentRoom;
    return {
      doorStates: newDoorStates,
      renderedGrid: room ? buildFullGrid(room, s.playerPos, newDoorStates, s.enemies, s.barrels, s.projectiles, s.playerInvincible) : s.renderedGrid,
    };
  }),

  startGame: () => {
    set({ gameStarted: true });
    get().loadLevel(0);
  },

  showHint: (text) => set({ hintVisible: true, hintText: text }),
  hideHint: () => set({ hintVisible: false, hintText: '' }),
  updateLastInputTime: () => set({ lastInputTime: Date.now(), hintVisible: false }),

  setEnemies: (enemies) => set({ enemies }),
  setBarrels: (barrels) => set({ barrels }),
  setContainers: (containers) => set({ containers }),
  setProjectiles: (projectiles) => set({ projectiles }),
  setPendingKey: (key) => set({ pendingKey: key }),
  setPendingVisualInner: (key) => set({ pendingVisualInner: key }),
  setPlayerDead: (dead) => set({ playerDead: dead }),
  setPlayerInvincible: (ticks) => set({ playerInvincible: ticks }),
  setPlayerDir: (dir) => set({ playerDir: dir }),
  setLastShotDir: (dir) => set({ lastShotDir: dir }),

  yankFromContainer: (bracketType) => {
    const state = get();
    if (state.mode !== 'VISUAL') return;

    const container = state.containers.find(
      (c) => !c.opened && c.bracketType === bracketType &&
        Math.abs(c.pos.x - state.playerPos.x) <= 2 &&
        Math.abs(c.pos.y - state.playerPos.y) <= 1
    );

    if (!container) {
      get().addMessage(`No nearby ${bracketType === '(' ? 'barrel' : 'chest'} to open.`, COLORS.textDim);
      set({ mode: 'NORMAL', pendingVisualInner: null });
      return;
    }

    container.opened = true;
    const item = container.item;
    item.collected = true;

    set({
      mode: 'NORMAL',
      pendingVisualInner: null,
      containers: state.containers.map((c) => c.id === container.id ? { ...c, opened: true } : c),
    });
    const weapon = lookupWeapon(item.id);
    get().addInventoryItem(item.id, item.name, item.char, weapon);
    get().addMessage(`Yanked: ${item.name} from ${bracketType === '(' ? 'barrel' : 'chest'}!`, COLORS.keyItem);
    get().rerenderGrid();
  },

  toggleInventory: () => {
    const state = get();
    set({ inventoryOpen: !state.inventoryOpen, inventoryCursor: 0 });
  },

  setInventoryCursor: (cursor) => set({ inventoryCursor: cursor }),

  assignQuickSlot: (itemIndex, slot) => {
    const state = get();
    const items = state.inventoryItems.map((item, i) => {
      if (i === itemIndex) return { ...item, quickSlot: slot };
      if (item.quickSlot === slot) return { ...item, quickSlot: null };
      return item;
    });
    set({ inventoryItems: items });
  },

  addInventoryItem: (id, name, char, weapon?) => {
    const state = get();
    const existing = state.inventoryItems.find((item) => item.id === id);
    if (existing) {
      set({
        inventoryItems: state.inventoryItems.map((item) =>
          item.id === id ? { ...item, count: item.count + 1 } : item
        ),
        inventory: [...state.inventory, id],
      });
    } else {
      const newItem: InventoryItem = { id, name, char, count: weapon?.maxAmmo ?? 1, quickSlot: null };
      if (weapon) newItem.weapon = weapon;
      set({
        inventoryItems: [...state.inventoryItems, newItem],
        inventory: [...state.inventory, id],
      });
    }
  },

  equipWeapon: (itemId) => {
    const state = get();
    const item = state.inventoryItems.find((i) => i.id === itemId && i.weapon);
    if (!item || !item.weapon) {
      get().addMessage('That item is not a weapon.', COLORS.textDim);
      return;
    }
    set({ equippedWeaponId: item.weapon.id });
    get().addMessage(`Equipped: ${item.weapon.name}`, COLORS.keyItem);
  },

  rerenderGrid: () => {
    const s = get();
    const room = s.currentRoom;
    if (!room) return;
    set({
      renderedGrid: buildFullGrid(room, s.playerPos, s.doorStates, s.enemies, s.barrels, s.projectiles, s.playerInvincible, s.containers),
    });
  },

  damagePlayer: (amount) => {
    const state = get();
    if (state.playerInvincible > 0 || state.playerDead) return;

    const newHP = Math.max(0, state.playerHP - amount);
    const dead = newHP <= 0;

    set({
      playerHP: newHP,
      playerDead: dead,
      playerInvincible: dead ? 0 : 3,
    });

    if (dead) {
      get().addMessage('You have been slain!', COLORS.hpFull);
    } else {
      get().addMessage(`Took ${amount} damage! HP: ${newHP}/${state.playerMaxHP}`, COLORS.hpFull);
    }
  },
}));
