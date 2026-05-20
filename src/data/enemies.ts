import type { Enemy, EnemyAI, Position } from '../engine/types';

/*
 * ENEMY SPEC
 *
 * Archetypes define stats; rooms place them with createEnemy(archetypeId, instanceId, pos).
 *
 * shootCooldown — game-loop ticks between ranged shots (lower = faster). Use 0 for non-shooters.
 * moveSpeed     — ticks between chase steps (lower = faster movement).
 */

export interface EnemyArchetype {
  name: string;
  chars: string[];
  ai: EnemyAI;
  maxHp: number;
  damage: number;
  shootCooldown: number;
  moveSpeed: number;
}

export const ENEMY_ARCHETYPES: Record<string, EnemyArchetype> = {
  goblin_grunt: {
    name: 'Goblin Grunt',
    chars: ['g'],
    ai: 'chase',
    maxHp: 3,
    damage: 1,
    shootCooldown: 0,
    moveSpeed: 4,
  },
  slime: {
    name: 'Slime',
    chars: ['s'],
    ai: 'chase_shoot',
    maxHp: 2,
    damage: 1,
    shootCooldown: 6,
    moveSpeed: 6,
  },
  dart_imp: {
    name: 'Dart Imp',
    chars: ['i'],
    ai: 'chase_shoot',
    maxHp: 2,
    damage: 1,
    shootCooldown: 4,
    moveSpeed: 5,
  },
};

export function createEnemy(archetypeId: string, instanceId: string, pos: Position): Enemy {
  const arc = ENEMY_ARCHETYPES[archetypeId];
  if (!arc) {
    throw new Error(`Unknown enemy archetype: ${archetypeId}`);
  }
  return {
    id: instanceId,
    archetypeId: archetypeId,
    name: arc.name,
    pos: { ...pos },
    hp: arc.maxHp,
    maxHp: arc.maxHp,
    chars: [...arc.chars],
    ai: arc.ai,
    damage: arc.damage,
    shootCooldown: arc.shootCooldown,
    ticksSinceShot: 0,
    moveSpeed: arc.moveSpeed,
    ticksSinceMove: 0,
    dead: false,
  };
}
