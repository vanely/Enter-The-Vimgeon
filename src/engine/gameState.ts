import { create } from 'zustand';
import { createCell } from '../utils/ascii';
import type { Cell } from '../utils/ascii';
import { COLORS } from '../utils/colors';
import type { VimMode, Position, Door, Sign, KeyItem, RoomTemplate, Message, GameState } from './types';

export type { VimMode, Position, Door, Sign, KeyItem, RoomTemplate, Message, GameState };

function doorKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function isSignChar(char: string): boolean {
  return char === '[' || char === '?' || char === ']';
}

function isWalkable(char: string): boolean {
  if (char === '.' || char === ' ' || char === '@' || isSignChar(char)) return true;
  if (char >= 'A' && char <= 'Z') return true;
  return false;
}

function isDoorChar(char: string): boolean {
  return char === '|' || char === '-';
}

function buildGrid(room: RoomTemplate, playerPos: Position, doorStates: Map<string, boolean>): Cell[][] {
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

  if (playerPos.y >= 0 && playerPos.y < grid.length &&
      playerPos.x >= 0 && playerPos.x < grid[0].length) {
    grid[playerPos.y][playerPos.x] = createCell('@', COLORS.player, undefined, true);
  }

  return grid;
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
  gameStarted: false,
  hintVisible: false,
  hintText: '',
  lastInputTime: Date.now(),
  nearbyItem: null,
  tutorialComplete: false,

  setMode: (mode) => set({ mode }),

  movePlayer: (dx, dy) => {
    const state = get();
    if (state.mode !== 'NORMAL' || state.helpOpen || state.signPopup) return;

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
          renderedGrid: buildGrid(room, state.playerPos, newDoorStates),
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
          renderedGrid: buildGrid(room, newPos, state.doorStates),
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

    const newPos = { x: newX, y: newY };
    const sign = checkSignCollision(newPos, room.signs, room.layout);

    const itemHere = room.keys.find(
      (k) => !k.collected && k.pos.x === newPos.x && k.pos.y === newPos.y
    ) ?? null;

    set({
      playerPos: newPos,
      renderedGrid: buildGrid(room, newPos, state.doorStates),
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
    const newInventory = [...state.inventory, item.id];

    set({
      mode: 'NORMAL',
      inventory: newInventory,
      nearbyItem: null,
      renderedGrid: buildGrid(room, state.playerPos, state.doorStates),
    });
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
      renderedGrid: buildGrid(room, playerPos, doorStates),
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
      renderedGrid: buildGrid(level, playerPos, doorStates),
      signPopup: null,
      messages: [{
        text: `-- ${level.name} --`,
        color: COLORS.accent,
        timestamp: Date.now(),
      }],
      hintVisible: false,
      mode: 'NORMAL',
      commandBuffer: '',
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
          renderedGrid: buildGrid(room, state.playerPos, newDoorStates),
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
      renderedGrid: room ? buildGrid(room, s.playerPos, newDoorStates) : s.renderedGrid,
    };
  }),

  startGame: () => {
    set({ gameStarted: true });
    get().loadLevel(0);
  },

  showHint: (text) => set({ hintVisible: true, hintText: text }),
  hideHint: () => set({ hintVisible: false, hintText: '' }),
  updateLastInputTime: () => set({ lastInputTime: Date.now(), hintVisible: false }),
}));
