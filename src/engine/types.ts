import type { Cell } from '../utils/ascii';

export type VimMode = 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND';

export interface Position {
  x: number;
  y: number;
}

export interface Door {
  pos: Position;
  open: boolean;
  gateCondition?: string;
  targetLevel?: number;
  chars: string[];
  requiredKey?: string;
}

export interface KeyItem {
  id: string;
  name: string;
  pos: Position;
  char: string;
  collected: boolean;
}

export interface Sign {
  pos: Position;
  text: string[];
  char?: string;
}

export interface RoomTemplate {
  width: number;
  height: number;
  layout: string[];
  doors: Door[];
  signs: Sign[];
  keys: KeyItem[];
  gateCondition?: string;
  name: string;
  hintText?: string;
  hintDelay?: number;
}

export interface Message {
  text: string;
  color?: string;
  timestamp: number;
}

export interface GameState {
  mode: VimMode;
  playerPos: Position;
  playerHP: number;
  playerMaxHP: number;
  playerMP: number;
  playerMaxMP: number;
  currentLevel: number;
  currentRoom: RoomTemplate | null;
  renderedGrid: Cell[][];
  messages: Message[];
  commandBuffer: string;
  helpOpen: boolean;
  helpSection: string;
  helpCursor: number;
  signPopup: string[] | null;
  unlockedKeys: Set<string>;
  doorStates: Map<string, boolean>;
  inventory: string[];
  gameStarted: boolean;
  hintVisible: boolean;
  hintText: string;
  lastInputTime: number;
  nearbyItem: KeyItem | null;
  tutorialComplete: boolean;

  setMode: (mode: VimMode) => void;
  movePlayer: (dx: number, dy: number) => void;
  yankItem: () => void;
  setCurrentRoom: (room: RoomTemplate) => void;
  loadLevel: (levelIndex: number) => void;
  addMessage: (text: string, color?: string) => void;
  setCommandBuffer: (cmd: string) => void;
  executeCommand: (cmd: string) => void;
  toggleHelp: (section?: string) => void;
  setHelpCursor: (cursor: number) => void;
  selectHelpSection: (section: string) => void;
  dismissSign: () => void;
  openDoor: (key: string) => void;
  startGame: () => void;
  showHint: (text: string) => void;
  hideHint: () => void;
  updateLastInputTime: () => void;
}
