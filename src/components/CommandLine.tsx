import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';

export function CommandLine() {
  const mode = useGameStore((s) => s.mode);
  const commandBuffer = useGameStore((s) => s.commandBuffer);

  if (mode !== 'COMMAND') return null;

  return (
    <div
      style={{
        padding: '4px 12px',
        backgroundColor: COLORS.bg,
        borderTop: `2px solid ${COLORS.modeCommand}`,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: '14px',
        color: COLORS.text,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <span style={{ color: COLORS.modeCommand, fontWeight: 'bold' }}>:</span>
      <span>{commandBuffer}</span>
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '16px',
          backgroundColor: COLORS.text,
          animation: 'blink 1s step-end infinite',
          marginLeft: '1px',
        }}
      />
    </div>
  );
}
