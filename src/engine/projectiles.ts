import type { Position, Projectile, Enemy, Barrel, RoomTemplate } from './types';

let nextProjectileId = 1;

function isBlocking(char: string): boolean {
  return char === '#' || char === '+' || char === '|' || char === '-';
}

export function createProjectile(
  pos: Position,
  dx: number,
  dy: number,
  owner: 'player' | 'enemy',
  damage: number = 1,
  projectileChar?: string,
): Projectile {
  const char = projectileChar ?? (owner === 'player' ? getPlayerBulletChar(dx, dy) : '*');
  return {
    id: nextProjectileId++,
    pos: { x: pos.x + dx, y: pos.y + dy },
    dx, dy, char, owner, damage,
  };
}

function getPlayerBulletChar(dx: number, dy: number): string {
  if (dx > 0) return '>';
  if (dx < 0) return '<';
  if (dy > 0) return 'v';
  if (dy < 0) return '^';
  return '>';
}

export function directionToward(from: Position, to: Position): { dx: number; dy: number } {
  const rawDx = to.x - from.x;
  const rawDy = to.y - from.y;
  if (Math.abs(rawDx) >= Math.abs(rawDy)) {
    return { dx: rawDx > 0 ? 1 : -1, dy: 0 };
  }
  return { dx: 0, dy: rawDy > 0 ? 1 : -1 };
}

export interface TickResult {
  updatedProjectiles: Projectile[];
  enemyHits: { enemyId: string; damage: number }[];
  playerHit: number;
  barrelHits: Position[];
}

export function advanceProjectiles(
  projectiles: Projectile[],
  room: RoomTemplate,
  enemies: Enemy[],
  barrels: Barrel[],
  playerPos: Position,
): TickResult {
  const result: TickResult = {
    updatedProjectiles: [],
    enemyHits: [],
    playerHit: 0,
    barrelHits: [],
  };

  for (const proj of projectiles) {
    const nx = proj.pos.x + proj.dx;
    const ny = proj.pos.y + proj.dy;

    if (nx < 0 || nx >= room.width || ny < 0 || ny >= room.height) continue;

    const layoutChar = room.layout[ny]?.[nx] || ' ';
    if (isBlocking(layoutChar)) continue;

    if (proj.owner === 'player') {
      const hitEnemy = enemies.find((e) => !e.dead && e.pos.x === nx && e.pos.y === ny);
      if (hitEnemy) {
        result.enemyHits.push({ enemyId: hitEnemy.id, damage: proj.damage });
        continue;
      }
      const hitBarrel = barrels.find((b) => !b.destroyed && b.pos.y === ny && nx >= b.pos.x - 1 && nx <= b.pos.x + 1);
      if (hitBarrel) {
        result.barrelHits.push({ ...hitBarrel.pos });
        continue;
      }
    }

    if (proj.owner === 'enemy') {
      if (nx === playerPos.x && ny === playerPos.y) {
        result.playerHit += proj.damage;
        continue;
      }
    }

    result.updatedProjectiles.push({ ...proj, pos: { x: nx, y: ny } });
  }

  return result;
}

export function scanForChar(
  room: RoomTemplate,
  playerPos: Position,
  targetChar: string,
  enemies: Enemy[],
): Position | null {
  const enemy = enemies.find((e) => !e.dead && e.chars[0] === targetChar);
  if (enemy) return { ...enemy.pos };

  for (let y = 0; y < room.height; y++) {
    for (let x = 0; x < room.width; x++) {
      if (x === playerPos.x && y === playerPos.y) continue;
      if (room.layout[y]?.[x] === targetChar) return { x, y };
    }
  }
  return null;
}
