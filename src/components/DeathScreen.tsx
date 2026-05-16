import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';

const DEATH_ART = [
  '▓██   ██▓ ▒█████   █    ██ ',
  ' ▒██  ██▒▒██▒  ██▒ ██  ▓██▒',
  '  ▒██ ██░▒██░  ██▒▓██  ▒██░',
  '   ░ ▐██▓▒██   ██░▓▓█  ░██░',
  '   ░ ██▒▓░ ████▓▒░▒▒█████▓ ',
  '',
  ' ▓█████▄  ██▓▓█████ ▓█████▄ ',
  ' ▒██▀ ██▌▓██▒▓█   ▀ ▒██▀ ██▌',
  ' ░██   █▌▒██▒▒███   ░██   █▌',
  ' ░▓█▄   ▌░██░▒▓█  ▄ ░▓█▄   ▌',
  ' ░▒████▓ ░██░░▒████▒░▒████▓ ',
];

export function DeathScreen() {
  const playerDead = useGameStore((s) => s.playerDead);

  if (!playerDead) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: COLORS.deathBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      }}
    >
      <pre
        style={{
          color: COLORS.hpFull,
          fontSize: '11px',
          lineHeight: '1.15',
          textAlign: 'center',
          margin: 0,
          letterSpacing: '0.5px',
        }}
      >
        {DEATH_ART.join('\n')}
      </pre>
      <div
        style={{
          marginTop: '32px',
          color: COLORS.deathText,
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        <div>Type <span style={{ color: COLORS.accent, fontWeight: 'bold' }}>:retry</span> to try again</div>
        <div style={{ marginTop: '8px', color: COLORS.textDim }}>
          Press <span style={{ color: COLORS.text }}>:</span> to enter command mode
        </div>
      </div>
    </div>
  );
}
