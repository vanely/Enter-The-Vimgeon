import type { Position, Enemy, RoomTemplate, Projectile } from './types';
import { createProjectile, directionToward } from './projectiles';

function isBlocking(char: string): boolean {
  return char === '#' || char === '+' || char === '|' || char === '-' || char === '_';
}

function canMoveTo(pos: Position, room: RoomTemplate, enemies: Enemy[], playerPos: Position): boolean {
  if (pos.x < 0 || pos.x >= room.width || pos.y < 0 || pos.y >= room.height) return false;
  const char = room.layout[pos.y]?.[pos.x] || ' ';
  if (isBlocking(char)) return false;
  if (pos.x === playerPos.x && pos.y === playerPos.y) return false;
  if (enemies.some((e) => !e.dead && e.pos.x === pos.x && e.pos.y === pos.y)) return false;
  return true;
}

export interface EnemyTickResult {
  updatedEnemies: Enemy[];
  newProjectiles: Projectile[];
  contactDamage: number;
}

function pickChaseStep(
  enemyPos: Position,
  playerPos: Position,
  preRowMovesRemaining: number,
): { dx: number; dy: number } {
  if (preRowMovesRemaining <= 0 || enemyPos.x === playerPos.x) {
    return directionToward(enemyPos, playerPos);
  }
  return { dx: playerPos.x > enemyPos.x ? 1 : -1, dy: 0 };
}

export function tickEnemies(
  enemies: Enemy[],
  room: RoomTemplate,
  playerPos: Position,
): EnemyTickResult {
  const result: EnemyTickResult = {
    updatedEnemies: [],
    newProjectiles: [],
    contactDamage: 0,
  };

  for (const enemy of enemies) {
    if (enemy.dead) {
      result.updatedEnemies.push(enemy);
      continue;
    }

    const updated = { ...enemy, pos: { ...enemy.pos } };
    updated.ticksSinceMove++;
    updated.ticksSinceShot++;

    const shouldMove = updated.ai === 'chase' || updated.ai === 'chase_shoot';
    const shouldShoot = updated.ai === 'shoot' || updated.ai === 'chase_shoot';

    if (shouldMove && updated.ticksSinceMove >= updated.moveSpeed) {
      updated.ticksSinceMove = 0;
      const preRowLeft = updated.preRowMovesRemaining ?? 0;
      let dir = pickChaseStep(updated.pos, playerPos, preRowLeft);
      let newPos = { x: updated.pos.x + dir.dx, y: updated.pos.y + dir.dy };

      if (newPos.x === playerPos.x && newPos.y === playerPos.y) {
        result.contactDamage += updated.damage;
      } else if (canMoveTo(newPos, room, enemies, playerPos)) {
        updated.pos = newPos;
        if (preRowLeft > 0) {
          updated.preRowMovesRemaining = preRowLeft - 1;
        }
      } else if (preRowLeft > 0 && updated.pos.x !== playerPos.x) {
        dir = directionToward(updated.pos, playerPos);
        newPos = { x: updated.pos.x + dir.dx, y: updated.pos.y + dir.dy };
        if (newPos.x === playerPos.x && newPos.y === playerPos.y) {
          result.contactDamage += updated.damage;
        } else if (canMoveTo(newPos, room, enemies, playerPos)) {
          updated.pos = newPos;
          updated.preRowMovesRemaining = preRowLeft - 1;
        }
      }
    }

    if (shouldShoot && updated.ticksSinceShot >= updated.shootCooldown) {
      updated.ticksSinceShot = 0;
      const dir = directionToward(updated.pos, playerPos);
      result.newProjectiles.push(
        createProjectile(updated.pos, dir.dx, dir.dy, 'enemy', updated.damage)
      );
    }

    const adjacent =
      Math.abs(updated.pos.x - playerPos.x) <= 1 &&
      Math.abs(updated.pos.y - playerPos.y) <= 1 &&
      !(updated.pos.x === playerPos.x && updated.pos.y === playerPos.y);

    if (adjacent && !shouldMove) {
      // idle enemies that happen to be adjacent don't deal contact damage
    }

    result.updatedEnemies.push(updated);
  }

  return result;
}
