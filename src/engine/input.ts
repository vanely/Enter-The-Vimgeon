import { useGameStore } from './gameState';
import { meleeStrike, repeatShot, findDodgeTarget, applyBarrelExplosion } from './combat';
import { COLORS } from '../utils/colors';

const MOVE_KEYS: Record<string, [number, number]> = {
  h: [-1, 0],
  j: [0, 1],
  k: [0, -1],
  l: [1, 0],
};

const INITIAL_DELAY_MS = 180;
const REPEAT_INTERVAL_MS = 100;

interface MoveRepeatState {
  key: string | null;
  direction: [number, number] | null;
  pressedAt: number;
  lastMoveAt: number;
  initialMoved: boolean;
  rafId: number | null;
}

const moveState: MoveRepeatState = {
  key: null,
  direction: null,
  pressedAt: 0,
  lastMoveAt: 0,
  initialMoved: false,
  rafId: null,
};

function tickMovement() {
  const state = useGameStore.getState();
  if (!moveState.direction || state.mode !== 'NORMAL' || state.helpOpen || state.signPopup || state.playerDead) {
    stopMovement();
    return;
  }

  const now = performance.now();

  if (!moveState.initialMoved) {
    state.movePlayer(moveState.direction[0], moveState.direction[1]);
    moveState.initialMoved = true;
    moveState.lastMoveAt = now;
  } else {
    const elapsed = now - moveState.pressedAt;
    if (elapsed >= INITIAL_DELAY_MS) {
      const sinceLast = now - moveState.lastMoveAt;
      if (sinceLast >= REPEAT_INTERVAL_MS) {
        state.movePlayer(moveState.direction[0], moveState.direction[1]);
        moveState.lastMoveAt = now;
      }
    }
  }

  moveState.rafId = requestAnimationFrame(tickMovement);
}

function startMovement(key: string, direction: [number, number]) {
  if (moveState.key === key) return;
  stopMovement();

  moveState.key = key;
  moveState.direction = direction;
  moveState.pressedAt = performance.now();
  moveState.lastMoveAt = 0;
  moveState.initialMoved = false;
  moveState.rafId = requestAnimationFrame(tickMovement);
}

function stopMovement() {
  if (moveState.rafId !== null) {
    cancelAnimationFrame(moveState.rafId);
  }
  moveState.key = null;
  moveState.direction = null;
  moveState.rafId = null;
  moveState.initialMoved = false;
}

export function handleKeyDown(e: KeyboardEvent): void {
  const state = useGameStore.getState();

  if (state.playerDead) {
    if (e.key === ':') {
      e.preventDefault();
      state.setMode('COMMAND');
      state.setCommandBuffer('');
      return;
    }
    if (state.mode === 'COMMAND') {
      handleCommandInput(e, state);
    }
    return;
  }

  if (state.inventoryOpen) {
    handleInventoryInput(e, state);
    return;
  }

  if (state.signPopup) {
    state.dismissSign();
    state.updateLastInputTime();
    return;
  }

  if (state.helpOpen) {
    handleHelpInput(e, state);
    return;
  }

  if (state.mode === 'COMMAND') {
    handleCommandInput(e, state);
    return;
  }

  if (state.mode === 'VISUAL') {
    handleVisualInput(e, state);
    return;
  }

  if (state.mode === 'NORMAL') {
    handleNormalInput(e, state);
    return;
  }
}

export function handleKeyUp(e: KeyboardEvent): void {
  if (e.key in MOVE_KEYS && moveState.key === e.key) {
    stopMovement();
  }
}

function handleNormalInput(e: KeyboardEvent, state: ReturnType<typeof useGameStore.getState>): void {
  const key = e.key;

  if (key in MOVE_KEYS) {
    e.preventDefault();
    startMovement(key, MOVE_KEYS[key]);
    return;
  }

  switch (key) {
    case 'x':
      e.preventDefault();
      stopMovement();
      handleMelee(state);
      state.updateLastInputTime();
      break;
    case ';':
      e.preventDefault();
      stopMovement();
      handleShoot(state);
      state.updateLastInputTime();
      break;
    case '%':
      e.preventDefault();
      stopMovement();
      handleDodge(state);
      state.updateLastInputTime();
      break;
    case 'v': {
      e.preventDefault();
      stopMovement();
      const nearbyContainer = state.containers.find(
        (c) => !c.opened &&
          Math.abs(c.pos.x - state.playerPos.x) <= 2 &&
          Math.abs(c.pos.y - state.playerPos.y) <= 1
      );
      if (!state.nearbyItem && !nearbyContainer) {
        state.addMessage('Nothing to select here.');
      } else {
        state.setMode('VISUAL');
      }
      state.updateLastInputTime();
      break;
    }
    case ':':
      e.preventDefault();
      stopMovement();
      state.setMode('COMMAND');
      state.setCommandBuffer('');
      state.updateLastInputTime();
      break;
    case 'Escape':
      e.preventDefault();
      stopMovement();
      state.setMode('NORMAL');
      state.updateLastInputTime();
      break;
    default:
      if (e.ctrlKey && key === 'd') {
        e.preventDefault();
        handleDodgeRoll(state, 5);
      } else if (e.ctrlKey && key === 'u') {
        e.preventDefault();
        handleDodgeRoll(state, -5);
      }
      break;
  }
}

function handleMelee(state: ReturnType<typeof useGameStore.getState>): void {
  const room = state.currentRoom;
  if (!room) return;

  const result = meleeStrike(state.playerPos, state.enemies, state.barrels, state.playerDir);
  const killed = result.killed;

  let enemies = result.updatedEnemies;
  let barrels = result.updatedBarrels;

  for (const bPos of result.barrelHits) {
    const explResult = applyBarrelExplosion(bPos, enemies, state.playerPos);
    enemies = explResult.updatedEnemies;
    if (explResult.playerDamage > 0) {
      useGameStore.getState().damagePlayer(explResult.playerDamage);
    }
    for (const id of explResult.killed) {
      if (!killed.includes(id)) killed.push(id);
    }
  }

  useGameStore.setState({ enemies, barrels });

  if (killed.length > 0) {
    for (const id of killed) {
      const e = enemies.find((en) => en.id === id);
      if (e) state.addMessage(`Defeated ${e.name}!`, COLORS.doorOpen);
    }
  } else if (result.barrelHits.length > 0) {
    state.addMessage('Barrel explodes!', COLORS.explosion);
  } else {
    state.addMessage('Strike!', COLORS.text);
  }

  useGameStore.getState().rerenderGrid();
}

function handleShoot(state: ReturnType<typeof useGameStore.getState>): void {
  const proj = repeatShot(state.playerPos, state.playerDir);
  useGameStore.setState({
    projectiles: [...state.projectiles, proj],
    lastShotDir: state.playerDir,
  });
  state.addMessage('Shot!', COLORS.projectilePlayer);
  useGameStore.getState().rerenderGrid();
}

function handleDodge(state: ReturnType<typeof useGameStore.getState>): void {
  const room = state.currentRoom;
  if (!room) return;

  const target = findDodgeTarget(state.playerPos, room);
  if (!target) {
    state.addMessage('No bracket pair found to dodge to.', COLORS.textDim);
    return;
  }

  useGameStore.setState({
    playerPos: target,
    playerInvincible: 2,
  });
  state.addMessage('Dodge!', COLORS.modeVisual);
  useGameStore.getState().rerenderGrid();
}

function handleDodgeRoll(state: ReturnType<typeof useGameStore.getState>, dy: number): void {
  const room = state.currentRoom;
  if (!room) return;

  let targetY = state.playerPos.y + dy;
  targetY = Math.max(1, Math.min(targetY, room.height - 2));

  const layoutChar = room.layout[targetY]?.[state.playerPos.x] || '#';
  if (layoutChar === '#' || layoutChar === '+' || layoutChar === '|' || layoutChar === '-') {
    state.addMessage('Can\'t roll there!', COLORS.textDim);
    return;
  }

  useGameStore.setState({
    playerPos: { x: state.playerPos.x, y: targetY },
    playerInvincible: 3,
  });
  state.addMessage(dy > 0 ? 'Roll down!' : 'Roll up!', COLORS.modeVisual);
  useGameStore.getState().rerenderGrid();
}

function handleVisualInput(e: KeyboardEvent, state: ReturnType<typeof useGameStore.getState>): void {
  const key = e.key;

  if (key === 'Escape') {
    e.preventDefault();
    state.setMode('NORMAL');
    state.setPendingVisualInner(null);
    state.updateLastInputTime();
    return;
  }

  if (state.pendingVisualInner === 'i') {
    e.preventDefault();
    if (key === '(' || key === '9') {
      state.setPendingVisualInner('(');
      state.addMessage('vi( -- press y to yank from barrel', COLORS.modeVisual);
    } else if (key === '{') {
      state.setPendingVisualInner('{');
      state.addMessage('vi{ -- press y to yank from chest', COLORS.modeVisual);
    } else {
      state.setPendingVisualInner(null);
      state.addMessage('Invalid inner selection.', COLORS.textDim);
    }
    state.updateLastInputTime();
    return;
  }

  if (state.pendingVisualInner === '(' || state.pendingVisualInner === '{') {
    e.preventDefault();
    if (key === 'y') {
      state.yankFromContainer(state.pendingVisualInner);
    } else {
      state.setPendingVisualInner(null);
      state.addMessage('Cancelled.', COLORS.textDim);
    }
    state.updateLastInputTime();
    return;
  }

  if (key === 'y') {
    e.preventDefault();
    state.yankItem();
    state.updateLastInputTime();
    return;
  }

  if (key === 'i') {
    e.preventDefault();
    state.setPendingVisualInner('i');
    state.addMessage('vi_ -- select bracket type: ( for barrel, { for chest', COLORS.modeVisual);
    state.updateLastInputTime();
    return;
  }
}

function handleCommandInput(e: KeyboardEvent, state: ReturnType<typeof useGameStore.getState>): void {
  const key = e.key;

  if (key === 'Escape') {
    e.preventDefault();
    state.setMode('NORMAL');
    state.setCommandBuffer('');
    state.updateLastInputTime();
    return;
  }

  if (key === 'Enter') {
    e.preventDefault();
    const cmd = state.commandBuffer;
    state.executeCommand(cmd);
    state.updateLastInputTime();
    return;
  }

  if (key === 'Backspace') {
    e.preventDefault();
    const buf = state.commandBuffer;
    if (buf.length === 0) {
      state.setMode('NORMAL');
    } else {
      state.setCommandBuffer(buf.slice(0, -1));
    }
    state.updateLastInputTime();
    return;
  }

  if (key.length === 1) {
    e.preventDefault();
    state.setCommandBuffer(state.commandBuffer + key);
    state.updateLastInputTime();
  }
}

function handleInventoryInput(e: KeyboardEvent, state: ReturnType<typeof useGameStore.getState>): void {
  const key = e.key;
  e.preventDefault();

  if (key === 'Escape' || key === 'q') {
    state.toggleInventory();
    return;
  }

  if (key === ':') {
    state.setMode('COMMAND');
    state.setCommandBuffer('');
    return;
  }

  if (key === 'j') {
    const max = state.inventoryItems.length - 1;
    state.setInventoryCursor(Math.min(state.inventoryCursor + 1, Math.max(0, max)));
    return;
  }

  if (key === 'k') {
    state.setInventoryCursor(Math.max(state.inventoryCursor - 1, 0));
    return;
  }

  if (key === '1' || key === '2' || key === '3') {
    const slot = parseInt(key);
    if (state.inventoryItems.length > 0) {
      state.assignQuickSlot(state.inventoryCursor, slot);
    }
    return;
  }
}

function handleHelpInput(e: KeyboardEvent, state: ReturnType<typeof useGameStore.getState>): void {
  const key = e.key;

  if (key === 'Escape' || key === 'q') {
    e.preventDefault();
    if (state.helpSection !== 'main') {
      state.selectHelpSection('main');
    } else {
      state.toggleHelp();
    }
    state.updateLastInputTime();
    return;
  }

  if (key === ':') {
    e.preventDefault();
    state.setMode('COMMAND');
    state.setCommandBuffer('');
    state.updateLastInputTime();
    return;
  }

  const sections = ['controls', 'combat', 'items', 'spells', 'map', 'bestiary', 'lore'];

  if (key === 'j') {
    e.preventDefault();
    if (state.helpSection === 'main') {
      state.setHelpCursor(Math.min(state.helpCursor + 1, sections.length - 1));
    }
    state.updateLastInputTime();
    return;
  }

  if (key === 'k') {
    e.preventDefault();
    if (state.helpSection === 'main') {
      state.setHelpCursor(Math.max(state.helpCursor - 1, 0));
    }
    state.updateLastInputTime();
    return;
  }

  if (key === 'Enter') {
    e.preventDefault();
    if (state.helpSection === 'main') {
      const section = sections[state.helpCursor];
      if (section) {
        state.selectHelpSection(section);
      }
    }
    state.updateLastInputTime();
    return;
  }
}
