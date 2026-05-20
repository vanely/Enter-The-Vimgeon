import type { Cell } from '../utils/ascii';

export type VimMode = 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND';

export type EnemyAI = 'idle' | 'chase' | 'shoot' | 'chase_shoot';

export interface Position {
  x: number;
  y: number;
}

export interface Projectile {
  id: number;
  pos: Position;
  dx: number;
  dy: number;
  char: string;
  owner: 'player' | 'enemy' | 'light';
  damage: number;
}

export interface Enemy {
  id: string;
  /** Archetype key in `ENEMY_ARCHETYPES` (bestiary + balancing). */
  archetypeId: string;
  name: string;
  pos: Position;
  hp: number;
  maxHp: number;
  chars: string[];
  ai: EnemyAI;
  damage: number;
  shootCooldown: number;
  ticksSinceShot: number;
  moveSpeed: number;
  ticksSinceMove: number;
  dead: boolean;
  /** Chase moves (1–4) before prioritizing the player's row; set on spawn in loadLevel. */
  preRowMovesRemaining?: number;
}

export interface Barrel {
  pos: Position;
  destroyed: boolean;
  explosionFrame: number;
  containsItem?: KeyItem;
}

export interface Container {
  id: string;
  pos: Position;
  char: string;
  openChar: string;
  bracketType: '(' | '{' | '[';
  item: KeyItem;
  opened: boolean;
}

export interface Door {
  pos: Position;
  open: boolean;
  gateCondition?: string;
  targetLevel?: number;
  /** Two `|` (north/south) or four `_` in 2×2 row-major (east/west). */
  chars: string[];
  requiredKey?: string;
  /**
   * When set, stepping through this exit moves on the dungeon grid instead of a tutorial index.
   */
  dungeonDelta?: { dx: number; dy: number };
  /** Walking through opens the first procedural dungeon run (post-tutorial). */
  startDungeonRun?: boolean;
  /**
   * Horizontal (default): `chars` span east from `pos` (north/south jambs: use two `|`).
   * Vertical: `chars` span south from `pos` (legacy two tall `|` on one column).
   * **Four** `chars`: 2×2 block from `pos` (top-left), row-major — use for east/west `____` doors.
   */
  orientation?: 'horizontal' | 'vertical';
}

export interface KeyItem {
  id: string;
  name: string;
  pos: Position;
  char: string;
  collected: boolean;
  /** When set, yanking this pickup merges into inventory under this id (stack id). */
  pickupInventoryId?: string;
}

export interface Sign {
  pos: Position;
  text: string[];
  char?: string;
}

export interface LightPuzzleConfig {
  /** Emitter cell (layout should contain `S` here). */
  source: Position;
  /** Initial beam direction (unit vector). */
  sourceDir: { dx: number; dy: number };
  /** Sensor cell (layout `R`); hitting it opens doors with gateCondition `light_puzzle`. */
  receptor: Position;
}

export interface RoomTemplate {
  width: number;
  height: number;
  layout: string[];
  doors: Door[];
  signs: Sign[];
  keys: KeyItem[];
  enemies: Enemy[];
  barrels: Barrel[];
  containers: Container[];
  gateCondition?: string;
  name: string;
  hintText?: string;
  hintDelay?: number;
  /** When set, a `projectiles` entry with `owner: 'light'` is spawned; mirrors `/` `\\` bend it (see projectiles.ts). */
  lightPuzzle?: LightPuzzleConfig;
  /**
   * Extra single-character layout glyphs that block walking (merged with engine defaults `# * +`).
   * Use for room-specific props without changing global walk rules.
   */
  collisionChars?: string[];
}

export interface Weapon {
  id: string;
  name: string;
  projectileChar: string;
  damage: number;
  ammoType: 'ammo' | 'cooldown';
  maxAmmo: number | null;
  cooldownTicks: number;
}

/** Static effect data for stackable consumables (potions, food, etc.). */
export interface ConsumableSpec {
  healHp: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  char: string;
  count: number;
  quickSlot: number | null;
  weapon?: Weapon;
  consumable?: ConsumableSpec;
}

export interface Message {
  text: string;
  color?: string;
  timestamp: number;
}

export type RunMode = 'tutorial' | 'dungeon';

export type DungeonRoomKind = 'start' | 'combat' | 'treasure' | 'boss' | 'arena';

export interface DungeonCell {
  kind: DungeonRoomKind;
  id: string;
}

export interface GameState {
  mode: VimMode;
  playerPos: Position;
  playerHP: number;
  playerMaxHP: number;
  playerMP: number;
  playerMaxMP: number;
  currentLevel: number;
  runMode: RunMode;
  dungeonFloor: number;
  /** Procedural floor grid; null cells are void. */
  dungeonGrid: (DungeonCell | null)[][] | null;
  /** Player position in dungeonGrid coordinates. */
  dungeonGridPos: Position | null;
  /** Keys "gx,gy" for explored rooms on the current floor. */
  exploredDungeonCells: Set<string>;
  /** Archetype ids (e.g. goblin_grunt) seen this run — feeds :help bestiary. */
  encounteredEnemies: Set<string>;
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
  inventoryItems: InventoryItem[];
  inventoryOpen: boolean;
  inventoryCursor: number;
  gameStarted: boolean;
  hintVisible: boolean;
  hintText: string;
  lastInputTime: number;
  nearbyItem: KeyItem | null;
  tutorialComplete: boolean;

  enemies: Enemy[];
  barrels: Barrel[];
  containers: Container[];
  projectiles: Projectile[];
  playerDir: { dx: number; dy: number };
  lastShotDir: { dx: number; dy: number } | null;
  playerInvincible: number;
  pendingKey: string | null;
  pendingVisualInner: string | null;
  playerDead: boolean;
  /** Inventory row id of equipped weapon or consumable (gg / d / p). */
  equippedItemId: string | null;
  weaponCooldown: number;
  /** Ticks until next melee (`x`); decremented each game loop tick. */
  meleeCooldown: number;
  lightPuzzleSolved: boolean;
  /** Set when :help is run once (tutorial help gate). */
  hasDemoedHelpMenu: boolean;

  setMode: (mode: VimMode) => void;
  movePlayer: (dx: number, dy: number) => void;
  yankItem: () => void;
  setCurrentRoom: (room: RoomTemplate) => void;
  loadLevel: (levelIndex: number) => void;
  startDungeonRun: () => void;
  transitionDungeonByDoor: (delta: { dx: number; dy: number }) => void;
  jumpLandmarkForward: () => void;
  jumpLandmarkBackward: () => void;
  jumpLineStart: () => void;
  jumpLineEnd: () => void;
  registerEncountersFromEnemies: (enemies: Enemy[]) => void;
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
  setEnemies: (enemies: Enemy[]) => void;
  setBarrels: (barrels: Barrel[]) => void;
  setContainers: (containers: Container[]) => void;
  setPendingVisualInner: (key: string | null) => void;
  yankFromContainer: (bracketType: string) => void;
  setProjectiles: (projectiles: Projectile[]) => void;
  setPendingKey: (key: string | null) => void;
  /** Flash Step: jump to `targetChar` on the current row (requires Flash Step charges on the ^ item). */
  tryFlashTeleport: (targetChar: string) => void;
  setPlayerDead: (dead: boolean) => void;
  setPlayerInvincible: (ticks: number) => void;
  setPlayerDir: (dir: { dx: number; dy: number }) => void;
  setLastShotDir: (dir: { dx: number; dy: number } | null) => void;
  damagePlayer: (amount: number) => void;
  rerenderGrid: () => void;
  toggleInventory: () => void;
  setInventoryCursor: (cursor: number) => void;
  assignQuickSlot: (itemIndex: number, slot: number) => void;
  useQuickSlot: (slot: number) => void;
  consumeInventoryItem: (itemId: string) => void;
  addInventoryItem: (
    id: string,
    name: string,
    char: string,
    weapon?: Weapon,
    consumable?: ConsumableSpec,
  ) => void;
  equipItem: (itemId: string) => void;
  dropEquippedItem: () => void;
}
