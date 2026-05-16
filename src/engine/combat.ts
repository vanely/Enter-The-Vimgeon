import type { Position, Enemy, Barrel, RoomTemplate, Projectile } from './types';
import { createProjectile, directionToward, scanForChar } from './projectiles';

export function meleeStrike(
  playerPos: Position,
  enemies: Enemy[],
  barrels: Barrel[],
  direction: { dx: number; dy: number },
): { updatedEnemies: Enemy[]; updatedBarrels: Barrel[]; killed: string[]; barrelHits: Position[] } {
  const damage = 2;
  const killed: string[] = [];
  const barrelHits: Position[] = [];

  const targetPos = { x: playerPos.x + direction.dx, y: playerPos.y + direction.dy };
  const adjacentPositions = [targetPos];

  const updatedEnemies = enemies.map((e) => {
    if (e.dead) return e;
    const isAdj = adjacentPositions.some((p) => p.x === e.pos.x && p.y === e.pos.y);
    if (!isAdj) return e;

    const newHp = e.hp - damage;
    if (newHp <= 0) {
      killed.push(e.id);
      return { ...e, hp: 0, dead: true };
    }
    return { ...e, hp: newHp };
  });

  const updatedBarrels = barrels.map((b) => {
    if (b.destroyed) return b;
    const isAdj = adjacentPositions.some((p) => p.x === b.pos.x && p.y === b.pos.y);
    if (isAdj) {
      barrelHits.push({ ...b.pos });
      return { ...b, destroyed: true, explosionFrame: 0 };
    }
    return b;
  });

  return { updatedEnemies, updatedBarrels, killed, barrelHits };
}

export function fireShot(
  playerPos: Position,
  targetChar: string,
  room: RoomTemplate,
  enemies: Enemy[],
): { projectile: Projectile | null; dir: { dx: number; dy: number } | null } {
  const target = scanForChar(room, playerPos, targetChar, enemies);
  if (!target) return { projectile: null, dir: null };

  const dir = directionToward(playerPos, target);
  return {
    projectile: createProjectile(playerPos, dir.dx, dir.dy, 'player', 1),
    dir,
  };
}

export function repeatShot(
  playerPos: Position,
  lastDir: { dx: number; dy: number },
): Projectile {
  return createProjectile(playerPos, lastDir.dx, lastDir.dy, 'player', 1);
}

export function applyBarrelExplosion(
  barrelPos: Position,
  enemies: Enemy[],
  playerPos: Position,
): { updatedEnemies: Enemy[]; playerDamage: number; killed: string[] } {
  const damage = 3;
  const killed: string[] = [];
  let playerDamage = 0;

  const dist = Math.abs(barrelPos.x - playerPos.x) + Math.abs(barrelPos.y - playerPos.y);
  if (dist <= 2) {
    playerDamage = damage;
  }

  const updatedEnemies = enemies.map((e) => {
    if (e.dead) return e;
    const d = Math.abs(barrelPos.x - e.pos.x) + Math.abs(barrelPos.y - e.pos.y);
    if (d <= 2) {
      const newHp = e.hp - damage;
      if (newHp <= 0) {
        killed.push(e.id);
        return { ...e, hp: 0, dead: true };
      }
      return { ...e, hp: newHp };
    }
    return e;
  });

  return { updatedEnemies, playerDamage, killed };
}

export function tickBarrelExplosions(barrels: Barrel[]): Barrel[] {
  return barrels.map((b) => {
    if (!b.destroyed || b.explosionFrame < 0 || b.explosionFrame >= 3) return b;
    return { ...b, explosionFrame: b.explosionFrame + 1 };
  });
}

export function findDodgeTarget(
  playerPos: Position,
  room: RoomTemplate,
): Position | null {
  const bracketPairs: [string, string][] = [['(', ')'], ['[', ']'], ['{', '}']];
  const allBrackets: { char: string; pos: Position }[] = [];

  for (let y = 0; y < room.height; y++) {
    for (let x = 0; x < room.width; x++) {
      const ch = room.layout[y]?.[x];
      if (ch && bracketPairs.some(([a, b]) => ch === a || ch === b)) {
        allBrackets.push({ char: ch, pos: { x, y } });
      }
    }
  }

  let nearest: { char: string; pos: Position } | null = null;
  let nearestDist = Infinity;

  for (const b of allBrackets) {
    const d = Math.abs(b.pos.x - playerPos.x) + Math.abs(b.pos.y - playerPos.y);
    if (d < nearestDist && d > 0) {
      nearest = b;
      nearestDist = d;
    }
  }

  if (!nearest) return null;

  let matchChar: string | null = null;
  for (const [a, b] of bracketPairs) {
    if (nearest.char === a) { matchChar = b; break; }
    if (nearest.char === b) { matchChar = a; break; }
  }

  if (!matchChar) return null;

  let matchTarget: Position | null = null;
  let matchDist = Infinity;

  for (const b of allBrackets) {
    if (b.char !== matchChar) continue;
    if (b.pos.x === nearest.pos.x && b.pos.y === nearest.pos.y) continue;
    const d = Math.abs(b.pos.x - playerPos.x) + Math.abs(b.pos.y - playerPos.y);
    if (d > nearestDist) {
      if (d < matchDist) {
        matchTarget = b.pos;
        matchDist = d;
      }
    }
  }

  if (!matchTarget) {
    for (const b of allBrackets) {
      if (b.char === matchChar && !(b.pos.x === nearest.pos.x && b.pos.y === nearest.pos.y)) {
        return { x: b.pos.x, y: b.pos.y };
      }
    }
  }

  return matchTarget;
}
