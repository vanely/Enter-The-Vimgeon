import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';
import { EnemyHealthBars } from './EnemyHealthBars';

export function GameGrid() {
  const renderedGrid = useGameStore((s) => s.renderedGrid);

  if (renderedGrid.length === 0) return null;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
        fontSize: '16px',
        lineHeight: 1.35,
        backgroundColor: COLORS.bg,
        padding: '4px 8px',
        border: `2px solid ${COLORS.helpBorder}`,
        boxShadow: `0 0 20px rgba(167, 139, 250, 0.15)`,
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {renderedGrid.map((row, y) => (
          <div key={y} style={{ display: 'flex', whiteSpace: 'pre' }}>
            {row.map((cell, x) => (
              <span
                key={x}
                style={{
                  color: cell.fg || COLORS.text,
                  backgroundColor: cell.bg || 'transparent',
                  fontWeight: cell.bold ? 'bold' : 'normal',
                  width: '1ch',
                  textAlign: 'center',
                }}
              >
                {cell.char}
              </span>
            ))}
          </div>
        ))}
      </div>
      <EnemyHealthBars />
    </div>
  );
}
