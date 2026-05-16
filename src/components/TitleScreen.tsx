import { COLORS } from '../utils/colors';
import { useGameStore } from '../engine/gameState';

const TITLE_ART = [
  '▓█████  ███▄    █ ▄▄▄█████▓▓█████  ██▀███  ',
  '▓█   ▀  ██ ▀█   █ ▓  ██▒ ▓▒▓█   ▀ ▓██ ▒ ██▒',
  '▒███   ▓██  ▀█ ██▒▒ ▓██░ ▒░▒███   ▓██ ░▄█ ▒',
  '▒▓█  ▄ ▓██▒  ▐▌██▒░ ▓██▓ ░ ▒▓█  ▄ ▒██▀▀█▄  ',
  '░▒████▒▒██░   ▓██░  ▒██▒ ░ ░▒████▒░██▓ ▒██▒',
  '',
  '▄▄▄█████▓ ██░ ██ ▓█████  ',
  '▓  ██▒ ▓▒▓██░ ██▒▓█   ▀  ',
  '▒ ▓██░ ▒░▒██▀▀██░▒███    ',
  '░ ▓██▓ ░ ░▓█ ░██ ▒▓█  ▄  ',
  '  ▒██▒ ░ ░▓█▒░██▓░▒████▒ ',
  '',
  '██▒   █▓ ██▓ ███▄ ▄███▓ ▄████ ▓█████  ▒█████   ███▄    █ ',
  '▓██░   █▒▓██▒▓██▒▀█▀ ██▒▓█   ▀ ▓█   ▀ ▒██▒  ██▒ ██ ▀█   █ ',
  ' ▓██  █▒░▒██▒▓██    ▓██░▒███   ▒███   ▒██░  ██▒▓██  ▀█ ██▒',
  '  ▒██ █░░░██░▒██    ▒██ ▒▓█  ▄ ▒▓█  ▄ ▒██   ██░▓██▒  ▐▌██▒',
  '   ▒▀█░  ░██░▒██▒   ░██▒░▒████▒░▒████▒░ ████▓▒░▒██░   ▓██░',
];

export function TitleScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const gameStarted = useGameStore((s) => s.gameStarted);

  if (gameStarted) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: COLORS.bg,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        color: COLORS.text,
      }}
    >
      <pre
        style={{
          color: COLORS.accent,
          fontSize: '11px',
          lineHeight: '1.15',
          textAlign: 'center',
          marginBottom: '24px',
          letterSpacing: '0.5px',
        }}
      >
        {TITLE_ART.join('\n')}
      </pre>

      <p style={{ color: COLORS.textDim, fontSize: '14px', marginBottom: '8px' }}>
        A dungeon crawler where your weapons are Vim motions
      </p>

      <button
        onClick={startGame}
        style={{
          marginTop: '24px',
          padding: '12px 32px',
          backgroundColor: 'transparent',
          border: `2px solid ${COLORS.accent}`,
          color: COLORS.accent,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.accent;
          e.currentTarget.style.color = COLORS.bg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = COLORS.accent;
        }}
      >
        Press to begin &mdash; or just press any key
      </button>

      <p style={{ color: COLORS.textDim, fontSize: '12px', marginTop: '32px' }}>
        hjkl to move &bull; : for commands &bull; :help for guidance
      </p>
    </div>
  );
}
