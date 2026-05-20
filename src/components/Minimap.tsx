import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';
import { DUNGEON_GRID_H, DUNGEON_GRID_W } from '../data/rooms/dungeonRooms';

export function Minimap() {
  const runMode = useGameStore((s) => s.runMode);
  const grid = useGameStore((s) => s.dungeonGrid);
  const pos = useGameStore((s) => s.dungeonGridPos);
  const explored = useGameStore((s) => s.exploredDungeonCells);

  if (runMode !== 'dungeon' || !grid || !pos) return null;

  const lines: string[] = [];
  for (let gy = 0; gy < DUNGEON_GRID_H; gy++) {
    let row = ' ';
    for (let gx = 0; gx < DUNGEON_GRID_W; gx++) {
      const cell = grid[gy]?.[gx];
      const key = `${gx},${gy}`;
      const here = gx === pos.x && gy === pos.y;
      if (!cell) {
        row += ' ';
        continue;
      }
      if (!explored.has(key)) {
        row += '?';
        continue;
      }
      if (here) row += '@';
      else if (cell.kind === 'boss') row += '!';
      else if (cell.kind === 'treasure') row += '$';
      else if (cell.kind === 'start') row += 'S';
      else row += '#';
    }
    lines.push(row);
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 40,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: 11,
        lineHeight: 1.25,
        color: COLORS.textDim,
        backgroundColor: 'rgba(24, 24, 27, 0.92)',
        border: `1px solid ${COLORS.textDim}`,
        padding: '8px 10px',
        pointerEvents: 'none',
      }}
    >
      <div style={{ color: COLORS.accent, marginBottom: 4, fontWeight: 'bold' }}>Map</div>
      <pre style={{ margin: 0 }}>{lines.join('\n')}</pre>
      <div style={{ marginTop: 6, fontSize: 10 }}>
        @ you · # room · $ loot · ! boss · ? unseen
      </div>
    </div>
  );
}
