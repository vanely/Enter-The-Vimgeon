import { useGameStore } from './gameState';

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
  if (!moveState.direction || state.mode !== 'NORMAL' || state.helpOpen || state.signPopup) {
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
    case 'v':
      e.preventDefault();
      stopMovement();
      state.setMode('VISUAL');
      state.updateLastInputTime();
      if (!state.nearbyItem) {
        state.addMessage('Nothing to select here.');
        state.setMode('NORMAL');
      }
      break;
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
      break;
  }
}

function handleVisualInput(e: KeyboardEvent, state: ReturnType<typeof useGameStore.getState>): void {
  const key = e.key;

  if (key === 'Escape') {
    e.preventDefault();
    state.setMode('NORMAL');
    state.updateLastInputTime();
    return;
  }

  if (key === 'y') {
    e.preventDefault();
    state.yankItem();
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
