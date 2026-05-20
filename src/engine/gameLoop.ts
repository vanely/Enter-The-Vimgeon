import { useGameStore, tryOpenAllEnemiesDeadGates } from './gameState';
import { advanceProjectiles, advanceLightPulse, createLightPulse } from './projectiles';
import { tickEnemies } from './entities';
import { applyBarrelExplosion, tickBarrelExplosions } from './combat';
import { openLightPuzzleDoors } from './lightPuzzle';
import { COLORS } from '../utils/colors';
import { TICK_RATE_MS } from './tickConfig';

let intervalId: ReturnType<typeof setInterval> | null = null;
let running = false;

function tick() {
  const state = useGameStore.getState();

  if (state.helpOpen || state.signPopup || state.mode === 'COMMAND' || state.playerDead || state.inventoryOpen) return;

  const room = state.currentRoom;
  if (!room) return;

  let enemies = [...state.enemies];
  let barrels = [...state.barrels];
  let projectiles = [...state.projectiles];
  const lightPulses = projectiles.filter((p) => p.owner === 'light');
  projectiles = projectiles.filter((p) => p.owner !== 'light');
  let totalPlayerDamage = 0;

  const projResult = advanceProjectiles(projectiles, room, enemies, barrels, state.playerPos, state.doorStates);
  projectiles = projResult.updatedProjectiles;
  totalPlayerDamage += projResult.playerHit;

  for (const hit of projResult.enemyHits) {
    enemies = enemies.map((e) => {
      if (e.id !== hit.enemyId) return e;
      const newHp = e.hp - hit.damage;
      if (newHp <= 0) {
        useGameStore.getState().addMessage(`Defeated ${e.name}!`, COLORS.doorOpen);
        return { ...e, hp: 0, dead: true };
      }
      return { ...e, hp: newHp };
    });
  }

  for (const bPos of projResult.barrelHits) {
    barrels = barrels.map((b) => {
      if (b.pos.x === bPos.x && b.pos.y === bPos.y && !b.destroyed) {
        return { ...b, destroyed: true, explosionFrame: 0 };
      }
      return b;
    });
  }

  const enemyResult = tickEnemies(enemies, room, state.playerPos);
  enemies = enemyResult.updatedEnemies;
  projectiles = [...projectiles, ...enemyResult.newProjectiles];
  totalPlayerDamage += enemyResult.contactDamage;

  const explodingBarrels = barrels.filter((b) => b.destroyed && b.explosionFrame === 0);
  for (const barrel of explodingBarrels) {
    const explResult = applyBarrelExplosion(barrel.pos, enemies, state.playerPos);
    enemies = explResult.updatedEnemies;
    totalPlayerDamage += explResult.playerDamage;
    for (const id of explResult.killed) {
      const killed = enemies.find((e) => e.id === id);
      if (killed) {
        useGameStore.getState().addMessage(`${killed.name} destroyed by explosion!`, COLORS.accent);
      }
    }
  }

  barrels = tickBarrelExplosions(barrels);

  let invincible = state.playerInvincible;
  if (invincible > 0) invincible--;

  let weaponCooldown = state.weaponCooldown;
  if (weaponCooldown > 0) weaponCooldown--;

  let meleeCooldown = state.meleeCooldown;
  if (meleeCooldown > 0) meleeCooldown--;

  const doorStates = new Map(state.doorStates);
  let lightPuzzleSolved = state.lightPuzzleSolved;

  if (room.lightPuzzle) {
    if (lightPulses.length > 0) {
      const step = advanceLightPulse(lightPulses[0], room, room.lightPuzzle, doorStates, lightPuzzleSolved);
      lightPuzzleSolved = step.solved;
      projectiles = [...projectiles, step.pulse];
      if (step.solvedJustNow) {
        openLightPuzzleDoors(room, doorStates);
        useGameStore.getState().addMessage('The beam strikes the sensor — refracted paths align!', COLORS.doorOpen);
      }
    } else if (!lightPuzzleSolved) {
      projectiles = [...projectiles, createLightPulse(room.lightPuzzle)];
    }
  } else {
    projectiles = [...projectiles, ...lightPulses];
  }

  const gateMsg = tryOpenAllEnemiesDeadGates(room, enemies, doorStates);
  if (gateMsg) {
    useGameStore.getState().addMessage(gateMsg, COLORS.doorOpen);
  }

  useGameStore.setState({
    enemies,
    barrels,
    projectiles,
    playerInvincible: invincible,
    weaponCooldown,
    meleeCooldown,
    doorStates,
    lightPuzzleSolved,
  });

  if (totalPlayerDamage > 0) {
    useGameStore.getState().damagePlayer(totalPlayerDamage);
  }

  useGameStore.getState().rerenderGrid();
}

export function startLoop() {
  if (running) return;
  running = true;
  intervalId = setInterval(tick, TICK_RATE_MS);
}

export function stopLoop() {
  running = false;
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function isLoopRunning(): boolean {
  return running;
}
