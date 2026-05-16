import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';

export function SignPopup() {
  const signPopup = useGameStore((s) => s.signPopup);

  if (!signPopup) return null;

  const maxLen = Math.max(...signPopup.map((l) => l.length), 30);
  const border = '+' + '='.repeat(maxLen + 2) + '+';

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: '14px',
        backgroundColor: COLORS.signBg,
        border: `2px solid ${COLORS.sign}`,
        padding: '0',
        boxShadow: `0 0 30px rgba(96, 165, 250, 0.3)`,
      }}
    >
      <pre
        style={{
          margin: 0,
          padding: '12px 16px',
          color: COLORS.signText,
          lineHeight: '1.5',
        }}
      >
        {border}
        {'\n'}
        {signPopup.map((line) => {
          const padded = line.padEnd(maxLen);
          return `| ${padded} |\n`;
        }).join('')}
        {border}
      </pre>
    </div>
  );
}
