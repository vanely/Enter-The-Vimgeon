import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';

function HealthBar({ current, max, color, emptyColor, label }: {
  current: number;
  max: number;
  color: string;
  emptyColor: string;
  label: string;
}) {
  const filled = Math.round((current / max) * 10);
  const empty = 10 - filled;
  return (
    <span>
      [{label}: <span style={{ color }}>{'\u2588'.repeat(filled)}</span>
      <span style={{ color: emptyColor }}>{'\u2591'.repeat(empty)}</span>]
    </span>
  );
}

function ModeIndicator({ mode }: { mode: string }) {
  const colorMap: Record<string, string> = {
    NORMAL: COLORS.modeNormal,
    INSERT: COLORS.modeInsert,
    VISUAL: COLORS.modeVisual,
    COMMAND: COLORS.modeCommand,
  };
  return (
    <span
      style={{
        color: COLORS.bg,
        backgroundColor: colorMap[mode] || COLORS.text,
        padding: '0 8px',
        fontWeight: 'bold',
        letterSpacing: '1px',
      }}
    >
      {mode}
    </span>
  );
}

export function HUD() {
  const mode = useGameStore((s) => s.mode);
  const hp = useGameStore((s) => s.playerHP);
  const maxHP = useGameStore((s) => s.playerMaxHP);
  const mp = useGameStore((s) => s.playerMP);
  const maxMP = useGameStore((s) => s.playerMaxMP);
  const currentLevel = useGameStore((s) => s.currentLevel);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '6px 12px',
        backgroundColor: COLORS.bgAlt,
        borderBottom: `1px solid ${COLORS.textDim}`,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: '14px',
        color: COLORS.text,
        flexWrap: 'wrap',
      }}
    >
      <ModeIndicator mode={mode} />
      <HealthBar current={hp} max={maxHP} color={COLORS.hpFull} emptyColor={COLORS.hpEmpty} label="HP" />
      <HealthBar current={mp} max={maxMP} color={COLORS.mpFull} emptyColor={COLORS.mpEmpty} label="MP" />
      <span style={{ color: COLORS.textDim, marginLeft: 'auto' }}>
        Tutorial {currentLevel}
      </span>
    </div>
  );
}
