import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';

/** Match GameGrid: coordinates are inside the padded content box. */
function hpFillColor(ratio: number): string {
  if (ratio > 0.6) return '#4ade80';
  if (ratio > 0.35) return COLORS.accent;
  return COLORS.hpFull;
}

export function EnemyHealthBars() {
  const enemies = useGameStore((s) => s.enemies);

  const living = enemies.filter((e) => !e.dead && e.maxHp > 0 && e.hp > 0);
  if (living.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {living.map((e) => {
        const ratio = Math.max(0, Math.min(1, e.hp / e.maxHp));
        return (
          <div
            key={e.id}
            title={`${e.name} ${e.hp}/${e.maxHp}`}
            style={{
              position: 'absolute',
              left: `calc(${e.pos.x} * 1ch - 0.5ch)`,
              top: `calc(${e.pos.y} * 1.35em - 2px)`,
              transform: 'translateY(-100%)',
              width: '2ch',
              height: '4px',
              borderRadius: '1px',
              backgroundColor: COLORS.hpEmpty,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                width: `${ratio * 100}%`,
                height: '100%',
                borderRadius: '1px',
                backgroundColor: hpFillColor(ratio),
                transition: 'width 0.12s ease-out',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
