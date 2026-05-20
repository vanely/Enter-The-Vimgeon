import { create } from 'zustand';
import { createCell } from '../utils/ascii';
import type { Cell } from '../utils/ascii';
import { COLORS } from '../utils/colors';
import type { VimMode, Position, Door, Sign, KeyItem, RoomTemplate, Message, GameState, Projectile, Enemy, Barrel, Container, InventoryItem, Weapon, ConsumableSpec } from './types';
import type { EnemyAI } from './types';
import { WEAPONS } from '../data/weapons';
import { createLightPulse, createProjectile } from './projectiles';
import { FLASH_STEP_CHARGES_PER_PICKUP, lookupConsumable } from '../data/items';
import { doorCellAt } from './doorGeometry';
import { terrainBlocksMovement } from './collision';
import { generateDungeonFloor, materializeDungeonRoom } from './dungeon';

function layoutStripPlayerAt(layout: string[]): string[] {
  return layout.map((row) => row.replace(/@/g, '.'));
}

function spawnPosForDungeonEntry(room: RoomTemplate, enteredFrom: { dx: number; dy: number }): Position {
  const cx = Math.floor(room.width / 2);
  const cy = Math.floor(room.height / 2);
  if (enteredFrom.dx === -1 && enteredFrom.dy === 0) {
    return { x: Math.min(room.width - 3, cx + 8), y: cy };
  }
  if (enteredFrom.dx === 1 && enteredFrom.dy === 0) {
    return { x: Math.max(2, cx - 8), y: cy };
  }
  if (enteredFrom.dx === 0 && enteredFrom.dy === -1) {
    return { x: cx, y: Math.min(room.height - 3, cy + 4) };
  }
  if (enteredFrom.dx === 0 && enteredFrom.dy === 1) {
    return { x: cx, y: Math.max(2, cy - 4) };
  }
  return findPlayerStart(room.layout);
}

function cloneRoomTemplate(template: RoomTemplate): RoomTemplate {
  return {
    ...template,
    layout: [...template.layout],
    doors: template.doors.map((d) => ({
      ...d,
      pos: { ...d.pos },
      open: false,
    })),
    signs: template.signs.map((s) => ({ ...s, pos: { ...s.pos }, text: [...s.text] })),
    keys: template.keys.map((k) => ({ ...k, pos: { ...k.pos }, collected: false })),
    enemies: template.enemies.map((e) => ({
      ...e,
      pos: { ...e.pos },
      dead: false,
      ticksSinceShot: 0,
      ticksSinceMove: 0,
      preRowMovesRemaining: 1 + Math.floor(Math.random() * 4),
    })),
    barrels: template.barrels.map((b) => ({ ...b, pos: { ...b.pos }, destroyed: false, explosionFrame: -1 })),
    containers: template.containers.map((c) => ({
      ...c,
      pos: { ...c.pos },
      item: { ...c.item, pos: { ...c.item.pos } },
      opened: false,
    })),
    lightPuzzle: template.lightPuzzle
      ? {
          source: { ...template.lightPuzzle.source },
          sourceDir: { ...template.lightPuzzle.sourceDir },
          receptor: { ...template.lightPuzzle.receptor },
        }
      : undefined,
  };
}

export type { VimMode, Position, Door, Sign, KeyItem, RoomTemplate, Message, GameState, Projectile, Enemy, Barrel, Container, InventoryItem, Weapon, ConsumableSpec, EnemyAI };

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
  return char === '(' || char === ')' || char === '{' || char === '}' || char === '[' || char === ']';
}

function isWalkable(char: string): boolean {
  if (char === '.' || char === ' ' || char === '@' || isSignChar(char) || isBracketChar(char)) return true;
  if (char === '/' || char === '\\' || char === `'` || char === 'R' || char === 'S') return true;
  if (char === '~' || char === '&' || char === '!' || char === 'T') return true;
  if (char >= 'A' && char <= 'Z') return true;
  if (char >= 'a' && char <= 'z') return true;
  return false;
}

function containerKindLabel(bracketType: string): string {
  if (bracketType === '(') return 'barrel';
  if (bracketType === '{') return 'chest';
  if (bracketType === '[') return 'locker';
  return 'container';
}

function isDoorChar(char: string): boolean {
  return char === '|' || char === '-' || char === '_';
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
        case '-':
        case '_': {
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
        case '/':
        case '\\':
          cell = createCell(char, COLORS.signText, '#1e3a5a', true);
          break;
        case `'`:
          cell = createCell('\'', COLORS.textDim, COLORS.bgAlt, true);
          break;
        case 'R':
          cell = createCell('R', COLORS.modeCommand, '#3f1720', true);
          break;
        case 'S':
          cell = createCell('S', COLORS.accent, '#422006', true);
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
  _room: RoomTemplate,
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
      const [lChar, rChar] =
        container.bracketType === '(' ? ['(', ')'] :
          container.bracketType === '[' ? ['[', ']'] :
            ['{', '}'];
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
    const color = proj.owner === 'player'
      ? COLORS.projectilePlayer
      : proj.owner === 'enemy'
        ? COLORS.projectileEnemy
        : COLORS.lightBeamHead;
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
  renderCombatEntities(grid, room, playerPos, enemies, barrels, projectiles, playerInvincible, containers);
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
      const p = doorCellAt(door, i);
      if (p.x === pos.x && p.y === pos.y) {
        return door;
      }
    }
  }
  return null;
}

/** When every enemy is dead, opens all `all_enemies_dead` doors (mutates `room.doors` and `doorStates`). */
export function tryOpenAllEnemiesDeadGates(
  room: RoomTemplate,
  enemies: Enemy[],
  doorStates: Map<string, boolean>,
): string | undefined {
  const allDead = enemies.length > 0 && enemies.every((e) => e.dead);
  if (!allDead) return undefined;
  let any = false;
  for (const door of room.doors) {
    if (door.open || door.gateCondition !== 'all_enemies_dead') continue;
    any = true;
    door.open = true;
    for (let i = 0; i < door.chars.length; i++) {
      const p = doorCellAt(door, i);
      doorStates.set(doorKey(p), true);
    }
  }
  return any ? 'All enemies defeated! The door opens!' : undefined;
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

/**
 * Milliseconds before a partial key chord is dropped. Vim's `'timeoutlen'` defaults
 * to 1000; set to 2000 in your head if you prefer a slower, more forgiving window.
 * @see https://vimhelp.org/options.txt.html#'timeoutlen'
 */
export const PENDING_CHORD_TIMEOUT_MS = 1000;

let pendingChordTimerId: ReturnType<typeof setTimeout> | null = null;

export function clearPendingChordTimer(): void {
  if (pendingChordTimerId !== null) {
    clearTimeout(pendingChordTimerId);
    pendingChordTimerId = null;
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  mode: 'NORMAL',
  playerPos: { x: 0, y: 0 },
  playerHP: 10,
  playerMaxHP: 10,
  playerMP: 5,
  playerMaxMP: 5,
  currentLevel: 0,
  runMode: 'tutorial',
  dungeonFloor: 0,
  dungeonGrid: null,
  dungeonGridPos: null,
  exploredDungeonCells: new Set<string>(),
  encounteredEnemies: new Set<string>(),
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
  equippedItemId: null,
  weaponCooldown: 0,
  meleeCooldown: 0,
  lightPuzzleSolved: false,
  hasDemoedHelpMenu: false,

  setMode: (mode) => set({ mode }),

  movePlayer: (dx, dy) => {
    const state = get();
    if ((state.mode !== 'NORMAL' && state.mode !== 'INSERT') || state.helpOpen || state.signPopup || state.playerDead) return;

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

      if (door && !door.open && door.gateCondition === 'help_then_reach' && !state.hasDemoedHelpMenu) {
        get().addMessage('The exit stays shut until you open :help (type : help then Enter).', COLORS.textDim);
        return;
      }

      if (
        door && !door.open &&
        (door.gateCondition === 'reach' ||
          (door.gateCondition === 'help_then_reach' && state.hasDemoedHelpMenu))
      ) {
        const newDoorStates = new Map(state.doorStates);
        for (let i = 0; i < door.chars.length; i++) {
          newDoorStates.set(doorKey(doorCellAt(door, i)), true);
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
        if (door?.startDungeonRun) {
          set({ lastInputTime: Date.now(), hintVisible: false });
          get().startDungeonRun();
          return;
        }
        if (door?.dungeonDelta && state.runMode === 'dungeon') {
          set({ lastInputTime: Date.now(), hintVisible: false });
          get().transitionDungeonByDoor(door.dungeonDelta);
          return;
        }
        if (door && door.targetLevel !== undefined && state.runMode === 'tutorial') {
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

    const pickupAtDest = room.keys.some(
      (k) => !k.collected && k.pos.x === newX && k.pos.y === newY,
    );
    if (!pickupAtDest && terrainBlocksMovement(targetChar, room)) {
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
    clearPendingChordTimer();
    const state = get();
    if (state.mode !== 'VISUAL') return;

    const room = state.currentRoom;
    if (!room || !state.nearbyItem) {
      get().addMessage('Nothing to yank here.', COLORS.textDim);
      set({ mode: 'NORMAL', pendingVisualInner: null });
      return;
    }

    const item = state.nearbyItem;
    item.collected = true;

    set({
      mode: 'NORMAL',
      pendingVisualInner: null,
      nearbyItem: null,
      renderedGrid: storeGrid(room, state.playerPos, state.doorStates, get),
    });
    const invId = item.pickupInventoryId ?? item.id;
    const weapon = lookupWeapon(invId);
    const consumable = lookupConsumable(invId);
    get().addInventoryItem(invId, item.name, item.char, weapon, consumable);
    get().addMessage(`Yanked: ${item.name}`, COLORS.keyItem);
  },

  setCurrentRoom: (room) => {
    const playerPos = findPlayerStart(room.layout);
    const doorStates = new Map<string, boolean>();
    for (const door of room.doors) {
      for (let i = 0; i < door.chars.length; i++) {
        doorStates.set(doorKey(doorCellAt(door, i)), door.open);
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

    clearPendingChordTimer();

    const level: RoomTemplate = {
      ...template,
      doors: template.doors.map((d) => ({ ...d, pos: { ...d.pos }, open: false })),
      signs: template.signs.map((s) => ({ ...s, pos: { ...s.pos }, text: [...s.text] })),
      keys: template.keys.map((k) => ({ ...k, pos: { ...k.pos }, collected: false })),
      enemies: template.enemies.map((e) => ({
        ...e,
        pos: { ...e.pos },
        dead: false,
        ticksSinceShot: 0,
        ticksSinceMove: 0,
        preRowMovesRemaining: 1 + Math.floor(Math.random() * 4),
      })),
      barrels: template.barrels.map((b) => ({ ...b, pos: { ...b.pos }, destroyed: false, explosionFrame: -1 })),
      containers: template.containers.map((c) => ({ ...c, pos: { ...c.pos }, item: { ...c.item, pos: { ...c.item.pos } }, opened: false })),
      lightPuzzle: template.lightPuzzle
        ? {
            source: { ...template.lightPuzzle.source },
            sourceDir: { ...template.lightPuzzle.sourceDir },
            receptor: { ...template.lightPuzzle.receptor },
          }
        : undefined,
    };

    const playerPos = findPlayerStart(level.layout);
    const doorStates = new Map<string, boolean>();
    for (const door of level.doors) {
      for (let i = 0; i < door.chars.length; i++) {
        doorStates.set(doorKey(doorCellAt(door, i)), false);
      }
    }
    const initialProjectiles = level.lightPuzzle ? [createLightPulse(level.lightPuzzle)] : [];
    set({
      currentLevel: levelIndex,
      runMode: 'tutorial',
      dungeonGrid: null,
      dungeonGridPos: null,
      exploredDungeonCells: new Set<string>(),
      currentRoom: level,
      playerPos,
      doorStates,
      renderedGrid: buildFullGrid(
        level,
        playerPos,
        doorStates,
        level.enemies,
        level.barrels,
        initialProjectiles,
        0,
        level.containers,
      ),
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
      projectiles: initialProjectiles,
      playerDir: { dx: 1, dy: 0 },
      lastShotDir: null,
      playerInvincible: 0,
      pendingKey: null,
      pendingVisualInner: null,
      playerDead: false,
      weaponCooldown: 0,
      meleeCooldown: 0,
      lightPuzzleSolved: false,
      playerHP: get().playerMaxHP,
      hasDemoedHelpMenu: false,
    });
    get().registerEncountersFromEnemies(level.enemies);
  },

  startDungeonRun: () => {
    clearPendingChordTimer();
    const floorIdx = 0;
    const { grid, startGridPos } = generateDungeonFloor(floorIdx);
    const raw = materializeDungeonRoom(grid, floorIdx, startGridPos.x, startGridPos.y);
    const level = cloneRoomTemplate(raw);
    const playerPos = findPlayerStart(level.layout);
    const doorStates = new Map<string, boolean>();
    for (const door of level.doors) {
      for (let i = 0; i < door.chars.length; i++) {
        doorStates.set(doorKey(doorCellAt(door, i)), false);
      }
    }
    const explored = new Set<string>([`${startGridPos.x},${startGridPos.y}`]);
    const uk = new Set(get().unlockedKeys);
    for (const k of ['w', 'b', '0', '$', ';']) uk.add(k);
    const initialProjectiles = level.lightPuzzle ? [createLightPulse(level.lightPuzzle)] : [];
    set({
      runMode: 'dungeon',
      dungeonFloor: floorIdx,
      dungeonGrid: grid,
      dungeonGridPos: { ...startGridPos },
      exploredDungeonCells: explored,
      tutorialComplete: true,
      unlockedKeys: uk,
      currentLevel: -1,
      currentRoom: level,
      playerPos,
      doorStates,
      renderedGrid: buildFullGrid(
        level,
        playerPos,
        doorStates,
        level.enemies,
        level.barrels,
        initialProjectiles,
        0,
        level.containers,
      ),
      signPopup: null,
      messages: [...get().messages.slice(-18), {
        text: '-- The Vimgeon opens before you... --',
        color: COLORS.accent,
        timestamp: Date.now(),
      }],
      hintVisible: false,
      mode: 'NORMAL',
      commandBuffer: '',
      enemies: level.enemies.map((e) => ({ ...e })),
      barrels: level.barrels.map((b) => ({ ...b })),
      containers: level.containers.map((c) => ({ ...c })),
      projectiles: initialProjectiles,
      playerDir: { dx: 1, dy: 0 },
      lastShotDir: null,
      playerInvincible: 0,
      pendingKey: null,
      pendingVisualInner: null,
      playerDead: false,
      weaponCooldown: 0,
      meleeCooldown: 0,
      lightPuzzleSolved: false,
      hasDemoedHelpMenu: true,
      playerHP: get().playerMaxHP,
      playerMP: get().playerMaxMP,
    });
    get().registerEncountersFromEnemies(level.enemies);
  },

  transitionDungeonByDoor: (delta) => {
    const state = get();
    const grid = state.dungeonGrid;
    const gpos = state.dungeonGridPos;
    if (!grid || !gpos || state.runMode !== 'dungeon') return;
    const nx = gpos.x + delta.dx;
    const ny = gpos.y + delta.dy;
    if (ny < 0 || ny >= grid.length || nx < 0 || nx >= (grid[0]?.length ?? 0)) return;
    const cell = grid[ny][nx];
    if (!cell) return;

    const raw = materializeDungeonRoom(grid, state.dungeonFloor, nx, ny);
    const level = cloneRoomTemplate({ ...raw, layout: layoutStripPlayerAt(raw.layout) });
    const enteredFrom = { dx: -delta.dx, dy: -delta.dy };
    const playerPos = spawnPosForDungeonEntry(level, enteredFrom);

    const doorStates = new Map<string, boolean>();
    for (const door of level.doors) {
      for (let i = 0; i < door.chars.length; i++) {
        doorStates.set(doorKey(doorCellAt(door, i)), false);
      }
    }
    const explored = new Set(state.exploredDungeonCells);
    explored.add(`${nx},${ny}`);
    const initialProjectiles = level.lightPuzzle ? [createLightPulse(level.lightPuzzle)] : [];

    set({
      dungeonGridPos: { x: nx, y: ny },
      exploredDungeonCells: explored,
      currentRoom: level,
      playerPos,
      doorStates,
      renderedGrid: buildFullGrid(
        level,
        playerPos,
        doorStates,
        level.enemies,
        level.barrels,
        initialProjectiles,
        0,
        level.containers,
      ),
      enemies: level.enemies.map((e) => ({ ...e })),
      barrels: level.barrels.map((b) => ({ ...b })),
      containers: level.containers.map((c) => ({ ...c })),
      projectiles: initialProjectiles,
      signPopup: null,
      mode: 'NORMAL',
      commandBuffer: '',
      lastShotDir: null,
      pendingKey: null,
      pendingVisualInner: null,
      lightPuzzleSolved: false,
    });
    get().addMessage(`-- ${level.name} --`, COLORS.accent);
    get().registerEncountersFromEnemies(level.enemies);
  },

  registerEncountersFromEnemies: (enemies) => {
    set((s) => {
      const next = new Set(s.encounteredEnemies);
      for (const e of enemies) {
        if (e.archetypeId) next.add(e.archetypeId);
      }
      return { encounteredEnemies: next };
    });
  },

  jumpLandmarkForward: () => {
    const state = get();
    if (state.mode !== 'NORMAL' || state.helpOpen || state.playerDead) return;
    const room = state.currentRoom;
    if (!room) return;
    const { dx, dy } = state.playerDir;
    if (dx === 0 && dy === 0) return;
    const interesting = (ch: string) =>
      ch !== '.' && ch !== ' ' && ch !== '@' && !isDoorChar(ch);
    let x = state.playerPos.x;
    let y = state.playerPos.y;
    const ox = x;
    const oy = y;
    const maxSteps = Math.max(room.width, room.height);
    for (let s = 0; s < maxSteps; s++) {
      x += dx;
      y += dy;
      if (y < 1 || y >= room.height - 1 || x < 1 || x >= room.width - 1) return;
      const ch = room.layout[y]?.[x] ?? '#';
      if (terrainBlocksMovement(ch, room)) return;
      if (interesting(ch)) {
        get().movePlayer(x - ox, y - oy);
        return;
      }
    }
  },

  jumpLandmarkBackward: () => {
    const state = get();
    if (state.mode !== 'NORMAL' || state.helpOpen || state.playerDead) return;
    const od = { ...state.playerDir };
    set({ playerDir: { dx: -od.dx, dy: -od.dy } });
    get().jumpLandmarkForward();
    set({ playerDir: od });
  },

  jumpLineStart: () => {
    const state = get();
    if (state.mode !== 'NORMAL' || state.helpOpen || state.playerDead) return;
    const room = state.currentRoom;
    if (!room) return;
    const y = state.playerPos.y;
    let tx = -1;
    for (let x = 1; x < room.width - 1; x++) {
      const ch = room.layout[y]?.[x] ?? '#';
      const pickupHere = room.keys.some((k) => !k.collected && k.pos.x === x && k.pos.y === y);
      const blocked =
        state.enemies.some((e) => !e.dead && e.pos.x === x && e.pos.y === y) ||
        state.barrels.some((b) => !b.destroyed && b.pos.y === y && x >= b.pos.x - 1 && x <= b.pos.x + 1);
      if (blocked) continue;
      if (isWalkable(ch) || pickupHere) {
        tx = x;
        break;
      }
    }
    if (tx < 0) return;
    get().movePlayer(tx - state.playerPos.x, 0);
  },

  jumpLineEnd: () => {
    const state = get();
    if (state.mode !== 'NORMAL' || state.helpOpen || state.playerDead) return;
    const room = state.currentRoom;
    if (!room) return;
    const y = state.playerPos.y;
    let tx = -1;
    for (let x = room.width - 2; x >= 1; x--) {
      const ch = room.layout[y]?.[x] ?? '#';
      const pickupHere = room.keys.some((k) => !k.collected && k.pos.x === x && k.pos.y === y);
      const blocked =
        state.enemies.some((e) => !e.dead && e.pos.x === x && e.pos.y === y) ||
        state.barrels.some((b) => !b.destroyed && b.pos.y === y && x >= b.pos.x - 1 && x <= b.pos.x + 1);
      if (blocked) continue;
      if (isWalkable(ch) || pickupHere) {
        tx = x;
        break;
      }
    }
   
    if (tx < 0) return;
    get().movePlayer(tx - state.playerPos.x, 0);
  },

  addMessage: (text, color) => set((s) => ({
    messages: [...s.messages.slice(-19), { text, color, timestamp: Date.now() }],
  })),

  setCommandBuffer: (cmd) => set({ commandBuffer: cmd }),

  executeCommand: (cmd) => {
    clearPendingChordTimer();
    const state = get();
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === 'help') {
      set({
        helpOpen: true,
        helpSection: 'main',
        helpCursor: 0,
        mode: 'NORMAL',
        commandBuffer: '',
        pendingKey: null,
        hasDemoedHelpMenu: true,
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
          newDoorStates.set(doorKey(doorCellAt(closedDoor, i)), true);
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
      set({ inventoryOpen: true, inventoryCursor: 0, commandBuffer: '', mode: 'NORMAL', pendingKey: null });
      get().addMessage('Opening inventory...', COLORS.signText);
      return;
    }

    if (trimmed.startsWith('equip')) {
      const raw = trimmed.replace('equip', '').trim();
      if (!raw) {
        get().addMessage('Usage: :equip <item_id or name>', COLORS.textDim);
        set({ commandBuffer: '', mode: 'NORMAL' });
        return;
      }
      const rl = raw.toLowerCase();
      const item = state.inventoryItems.find((i) => {
        if (!i.weapon && !i.consumable) return false;
        if (i.id === raw || i.id === rl) return true;
        if (i.name.toLowerCase() === rl) return true;
        if (i.weapon && (i.weapon.id === rl || i.weapon.name.toLowerCase() === rl)) return true;
        return false;
      });
      if (!item) {
        get().addMessage(`No equippable item "${raw}" in inventory.`, COLORS.hpFull);
        set({ commandBuffer: '', mode: 'NORMAL' });
        return;
      }
      set({ equippedItemId: item.id, commandBuffer: '', mode: 'NORMAL' });
      get().addMessage(`Equipped: ${item.name}`, COLORS.keyItem);
      return;
    }

    if (trimmed === 'skip-tutorial' || trimmed === 'skip tutorial') {
      set({ commandBuffer: '', mode: 'NORMAL' });
      get().startDungeonRun();
      get().addMessage('Tutorial skipped — entering the procedural dungeon.', COLORS.accent);
      return;
    }

    if (trimmed === 'heal') {
      if (state.playerMP < 2) {
        get().addMessage('Not enough MP for :heal (need 2).', COLORS.hpFull);
        set({ commandBuffer: '', mode: 'NORMAL' });
        return;
      }
      const nh = Math.min(state.playerMaxHP, state.playerHP + 5);
      set({
        playerHP: nh,
        playerMP: state.playerMP - 2,
        commandBuffer: '',
        mode: 'NORMAL',
      });
      get().addMessage(`Restored to ${nh} HP. (-2 MP)`, COLORS.doorOpen);
      return;
    }

    if (trimmed.startsWith('cast')) {
      const sub = trimmed.slice('cast'.length).trim();
      if (sub === 'fireball') {
        if (state.playerMP < 3) {
          get().addMessage('Not enough MP for :cast fireball (need 3).', COLORS.hpFull);
          set({ commandBuffer: '', mode: 'NORMAL' });
          return;
        }
        const room = state.currentRoom;
        if (!room) return;
        const pp = state.playerPos;
        const add = [
          createProjectile({ ...pp }, 1, 0, 'player', 2, '*'),
          createProjectile({ ...pp }, -1, 0, 'player', 2, '*'),
          createProjectile({ ...pp }, 0, 1, 'player', 2, '*'),
          createProjectile({ ...pp }, 0, -1, 'player', 2, '*'),
        ];
        set({
          projectiles: [...state.projectiles, ...add],
          playerMP: state.playerMP - 3,
          commandBuffer: '',
          mode: 'NORMAL',
        });
        get().addMessage('Fireball nova! (-3 MP)', COLORS.explosion);
        get().rerenderGrid();
        return;
      }
    }

    if (trimmed === 'retry') {
      set({ commandBuffer: '', mode: 'NORMAL' });
      if (get().runMode === 'dungeon') {
        get().startDungeonRun();
        get().addMessage('Regenerated procedural floor.', COLORS.accent);
      } else {
        const level = state.currentLevel;
        get().loadLevel(level);
        get().addMessage('Restarting level...', COLORS.accent);
      }
      return;
    }

    const warpMatch = trimmed.match(/^warp\s+(\d+)$/);
    if (warpMatch) {
      const n = parseInt(warpMatch[1]!, 10);
      const list = getTutorialLevels();
      if (n < 0 || n >= list.length) {
        get().addMessage(`No level index ${n} (valid: 0–${list.length - 1}).`, COLORS.hpFull);
      } else {
        get().loadLevel(n);
        get().addMessage(`Warped to level ${n}: ${list[n]?.name ?? '?'}.`, COLORS.accent);
      }
      set({ commandBuffer: '', mode: 'NORMAL' });
      return;
    }

    get().addMessage(`Unknown command: ${cmd}`, COLORS.hpFull);
    set({ commandBuffer: '', mode: 'NORMAL' });
  },

  toggleHelp: (section) => {
    const state = get();
    clearPendingChordTimer();
    if (state.helpOpen) {
      set({ helpOpen: false, helpSection: 'main', helpCursor: 0, pendingKey: null });
    } else {
      set({ helpOpen: true, helpSection: section || 'main', helpCursor: 0, pendingKey: null });
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
      renderedGrid: room ? buildFullGrid(room, s.playerPos, newDoorStates, s.enemies, s.barrels, s.projectiles, s.playerInvincible, s.containers) : s.renderedGrid,
    };
  }),

  startGame: () => {
    set({
      gameStarted: true,
      encounteredEnemies: new Set(),
    });
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

  tryFlashTeleport: (targetChar: string) => {
    const state = get();
    const room = state.currentRoom;
    if (!room) return;
    const flashItem = state.inventoryItems.find((i) => i.id === 'flash_step');
    if (!flashItem || flashItem.count <= 0) {
      get().addMessage(
        'Collect a Flash Step (^) for charges — then f and a character to blink along your row.',
        COLORS.textDim,
      );
      return;
    }
    const py = state.playerPos.y;
    const px = state.playerPos.x;
    const row = room.layout[py] || '';
    let tx: number | null = null;
    for (let x = px + 1; x < room.width; x++) {
      if (row[x] === targetChar) {
        tx = x;
        break;
      }
    }
    if (tx === null) {
      for (let x = px - 1; x >= 0; x--) {
        if (row[x] === targetChar) {
          tx = x;
          break;
        }
      }
    }
    if (tx === null) {
      get().addMessage(`No '${targetChar}' on this row.`, COLORS.textDim);
      return;
    }
    const newPos = { x: tx, y: py };
    const enemyBlocking = state.enemies.some((e) => !e.dead && e.pos.x === tx && e.pos.y === py);
    if (enemyBlocking) {
      get().addMessage('Something occupies that spot.', COLORS.textDim);
      return;
    }
    const barrelBlocking = state.barrels.some(
      (b) => !b.destroyed && b.pos.y === py && tx >= b.pos.x - 1 && tx <= b.pos.x + 1,
    );
    if (barrelBlocking) {
      get().addMessage('Something occupies that spot.', COLORS.textDim);
      return;
    }
    const containerBlocking = state.containers.some(
      (c) => !c.opened && c.pos.y === py && tx >= c.pos.x - 1 && tx <= c.pos.x + 1,
    );
    if (containerBlocking) {
      get().addMessage('Something occupies that spot.', COLORS.textDim);
      return;
    }
    const ch = row[tx] || ' ';
    const dk = doorKey({ x: tx, y: py });
    if (isDoorChar(ch) && state.doorStates.has(dk) && !state.doorStates.get(dk)) {
      get().addMessage('A closed door blocks that spot.', COLORS.textDim);
      return;
    }
    const sign = checkSignCollision(newPos, room.signs, room.layout);
    const itemHere =
      room.keys.find((k) => !k.collected && k.pos.x === newPos.x && k.pos.y === newPos.y) ?? null;
    const nextCount = flashItem.count - 1;
    const nextItems =
      nextCount <= 0
        ? state.inventoryItems.filter((i) => i.id !== 'flash_step')
        : state.inventoryItems.map((i) => (i.id === 'flash_step' ? { ...i, count: nextCount } : i));
    const nextInv =
      nextCount <= 0 ? state.inventory.filter((id) => id !== 'flash_step') : state.inventory;
    set({
      playerPos: newPos,
      renderedGrid: storeGrid(room, newPos, state.doorStates, get),
      signPopup: sign ? sign.text : null,
      nearbyItem: itemHere,
      lastInputTime: Date.now(),
      hintVisible: false,
      inventoryItems: nextItems,
      inventory: nextInv,
    });
    get().addMessage(
      nextCount <= 0 ? 'Flash Step! (out of charges)' : `Flash Step! (${nextCount} left)`,
      COLORS.accent,
    );
  },

  setPendingVisualInner: (key) => set({ pendingVisualInner: key }),
  setPlayerDead: (dead) => set({ playerDead: dead }),
  setPlayerInvincible: (ticks) => set({ playerInvincible: ticks }),
  setPlayerDir: (dir) => set({ playerDir: dir }),
  setLastShotDir: (dir) => set({ lastShotDir: dir }),

  yankFromContainer: (bracketType) => {
    clearPendingChordTimer();
    const state = get();
    if (state.mode !== 'VISUAL') return;

    const container = state.containers.find(
      (c) => !c.opened && c.bracketType === bracketType &&
        Math.abs(c.pos.x - state.playerPos.x) <= 2 &&
        Math.abs(c.pos.y - state.playerPos.y) <= 1
    );

    if (!container) {
      get().addMessage(`No nearby ${containerKindLabel(bracketType)} to open.`, COLORS.textDim);
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
    const invId = item.pickupInventoryId ?? item.id;
    const weapon = lookupWeapon(invId);
    const consumable = lookupConsumable(invId);
    get().addInventoryItem(invId, item.name, item.char, weapon, consumable);
    get().addMessage(`Yanked: ${item.name} from ${containerKindLabel(bracketType)}!`, COLORS.keyItem);
    get().rerenderGrid();
  },

  toggleInventory: () => {
    clearPendingChordTimer();
    const state = get();
    set({ inventoryOpen: !state.inventoryOpen, inventoryCursor: 0, pendingKey: null });
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

  consumeInventoryItem: (itemId) => {
    const state = get();
    const item = state.inventoryItems.find((i) => i.id === itemId);
    if (!item) {
      get().addMessage('Item not in inventory.', COLORS.textDim);
      return;
    }
    if (!item.consumable) {
      get().addMessage('gg consumes equipped potions and food. Use d to fire a weapon.', COLORS.textDim);
      return;
    }
    if (item.count <= 0) {
      set({ equippedItemId: state.equippedItemId === itemId ? null : state.equippedItemId });
      get().addMessage('Nothing left to use.', COLORS.textDim);
      return;
    }

    const heal = item.consumable.healHp;
    const newHP = Math.min(state.playerMaxHP, state.playerHP + heal);
    const healed = newHP - state.playerHP;

    if (item.count <= 1) {
      const nextItems = state.inventoryItems.filter((i) => i.id !== item.id);
      const idx = state.inventory.indexOf(item.id);
      const nextInv =
        idx === -1 ? state.inventory : [...state.inventory.slice(0, idx), ...state.inventory.slice(idx + 1)];
      set({
        playerHP: newHP,
        inventoryItems: nextItems,
        inventory: nextInv,
        equippedItemId: state.equippedItemId === itemId ? null : state.equippedItemId,
      });
    } else {
      set({
        playerHP: newHP,
        inventoryItems: state.inventoryItems.map((i) =>
          i.id === item.id ? { ...i, count: i.count - 1 } : i,
        ),
      });
    }

    get().addMessage(
      healed > 0
        ? `Used ${item.name}. +${healed} HP (${newHP}/${state.playerMaxHP})`
        : `Used ${item.name}. (already at full HP)`,
      COLORS.doorOpen,
    );
    get().rerenderGrid();
  },

  useQuickSlot: (slot) => {
    const state = get();
    const item = state.inventoryItems.find((i) => i.quickSlot === slot);
    if (!item) {
      get().addMessage(`Quick slot ${slot} is empty. Assign in :inv with 1–3 on a row.`, COLORS.textDim);
      return;
    }
    if (item.consumable) {
      get().consumeInventoryItem(item.id);
      return;
    }
    if (item.weapon) {
      get().equipItem(item.id);
      return;
    }
    get().addMessage('Nothing usable in that slot (equip a potion or weapon).', COLORS.textDim);
  },

  addInventoryItem: (id, name, char, weapon?, consumable?) => {
    const state = get();
    const existing = state.inventoryItems.find((item) => item.id === id);
    if (existing) {
      const delta = id === 'flash_step' ? FLASH_STEP_CHARGES_PER_PICKUP : 1;
      set({
        inventoryItems: state.inventoryItems.map((item) =>
          item.id === id ? { ...item, count: item.count + delta } : item
        ),
        inventory: state.inventory.includes(id) ? state.inventory : [...state.inventory, id],
      });
    } else {
      const newItem: InventoryItem = {
        id,
        name,
        char,
        count: id === 'flash_step' ? FLASH_STEP_CHARGES_PER_PICKUP : 1,
        quickSlot: null,
      };
      if (weapon) {
        newItem.weapon = weapon;
        newItem.count = weapon.maxAmmo ?? 1;
      }
      if (consumable) {
        newItem.consumable = consumable;
      }
      set({
        inventoryItems: [...state.inventoryItems, newItem],
        inventory: [...state.inventory, id],
      });
    }
  },

  equipItem: (itemId) => {
    const state = get();
    const item = state.inventoryItems.find((i) => i.id === itemId);
    if (!item || (!item.weapon && !item.consumable)) {
      get().addMessage('That item cannot be equipped.', COLORS.textDim);
      return;
    }
    set({ equippedItemId: item.id });
    get().addMessage(`Equipped: ${item.name}`, COLORS.keyItem);
  },

  dropEquippedItem: () => {
    const state = get();
    const room = state.currentRoom;
    if (!room) return;

    if (!state.equippedItemId) {
      get().addMessage('Nothing equipped to paste.', COLORS.textDim);
      return;
    }

    const item = state.inventoryItems.find((i) => i.id === state.equippedItemId);
    if (!item || item.count <= 0) {
      set({ equippedItemId: null });
      get().addMessage('Equipped item missing from inventory.', COLORS.textDim);
      return;
    }

    const { dx, dy } = state.playerDir;
    const tx = state.playerPos.x + dx;
    const ty = state.playerPos.y + dy;

    if (ty < 0 || ty >= room.height || tx < 0 || tx >= room.width) {
      get().addMessage('Can\'t paste there.', COLORS.textDim);
      return;
    }

    const layoutCh = room.layout[ty]?.[tx] || '#';
    const dk = doorKey({ x: tx, y: ty });
    const onClosedDoor = isDoorChar(layoutCh) && state.doorStates.has(dk) && !state.doorStates.get(dk);

    if (!isWalkable(layoutCh) || onClosedDoor) {
      get().addMessage('Can\'t paste there.', COLORS.textDim);
      return;
    }

    const enemyThere = state.enemies.some((e) => !e.dead && e.pos.x === tx && e.pos.y === ty);
    if (enemyThere) {
      get().addMessage('Can\'t paste there.', COLORS.textDim);
      return;
    }

    const barrelThere = state.barrels.some((b) => !b.destroyed && b.pos.y === ty && tx >= b.pos.x - 1 && tx <= b.pos.x + 1);
    if (barrelThere) {
      get().addMessage('Can\'t paste there.', COLORS.textDim);
      return;
    }

    const containerThere = state.containers.some((c) => !c.opened && c.pos.y === ty && tx >= c.pos.x - 1 && tx <= c.pos.x + 1);
    if (containerThere) {
      get().addMessage('Can\'t paste there.', COLORS.textDim);
      return;
    }

    const keyThere = room.keys.some((k) => !k.collected && k.pos.x === tx && k.pos.y === ty);
    if (keyThere) {
      get().addMessage('Can\'t paste there.', COLORS.textDim);
      return;
    }

    const floorKeyId = `floor_${item.id}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    room.keys.push({
      id: floorKeyId,
      name: item.name,
      char: item.char,
      pos: { x: tx, y: ty },
      collected: false,
      pickupInventoryId: item.id,
    });

    let nextItems: InventoryItem[];
    let nextInv: string[];
    let nextEquipped: string | null = state.equippedItemId;

    if (item.count <= 1) {
      nextItems = state.inventoryItems.filter((i) => i.id !== item.id);
      const idx = state.inventory.indexOf(item.id);
      nextInv = idx === -1 ? state.inventory : [...state.inventory.slice(0, idx), ...state.inventory.slice(idx + 1)];
      nextEquipped = null;
    } else {
      nextItems = state.inventoryItems.map((i) =>
        i.id === item.id ? { ...i, count: i.count - 1 } : i
      );
      nextInv = state.inventory;
    }

    set({
      inventoryItems: nextItems,
      inventory: nextInv,
      equippedItemId: nextEquipped,
      renderedGrid: storeGrid(room, state.playerPos, state.doorStates, get),
    });
    get().addMessage(`Pasted ${item.name} on the floor.`, COLORS.keyItem);
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

export type PendingChordWatch = { pendingKey: string } | { pendingVisualInner: string };

export function armPendingChordTimer(watch: PendingChordWatch): void {
  clearPendingChordTimer();
  pendingChordTimerId = setTimeout(() => {
    pendingChordTimerId = null;
    const s = useGameStore.getState();
    if ('pendingKey' in watch && s.pendingKey === watch.pendingKey) {
      useGameStore.setState({ pendingKey: null });
    } else if ('pendingVisualInner' in watch && s.pendingVisualInner === watch.pendingVisualInner) {
      useGameStore.setState({ pendingVisualInner: null });
    }
  }, PENDING_CHORD_TIMEOUT_MS);
}
