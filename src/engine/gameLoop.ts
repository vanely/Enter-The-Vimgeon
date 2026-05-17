import { useGameStore } from './gameState';
import { advanceProjectiles } from './projectiles';
import { tickEnemies } from './entities';
import { applyBarrelExplosion, tickBarrelExplosions } from './combat';
import { COLORS } from '../utils/colors';

const TICK_RATE_MS = 150;

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
  let totalPlayerDamage = 0;

  const projResult = advanceProjectiles(projectiles, room, enemies, barrels, state.playerPos);
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

  useGameStore.setState({
    enemies,
    barrels,
    projectiles,
    playerInvincible: invincible,
    weaponCooldown,
  });

  if (totalPlayerDamage > 0) {
    useGameStore.getState().damagePlayer(totalPlayerDamage);
  }

  const allDead = enemies.length > 0 && enemies.every((e) => e.dead);
  if (allDead) {
    const closedDoor = room.doors.find((d) => !d.open && d.gateCondition === 'all_enemies_dead');
    if (closedDoor) {
      const doorStates = new Map(useGameStore.getState().doorStates);
      for (let i = 0; i < closedDoor.chars.length; i++) {
        doorStates.set(`${closedDoor.pos.x + i},${closedDoor.pos.y}`, true);
      }
      closedDoor.open = true;
      useGameStore.setState({ doorStates });
      useGameStore.getState().addMessage('All enemies defeated! The door opens!', COLORS.doorOpen);
    }
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
