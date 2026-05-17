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
  const pendingVisualInner = useGameStore((s) => s.pendingVisualInner);
  const pendingKey = useGameStore((s) => s.pendingKey);
  const playerDir = useGameStore((s) => s.playerDir);
  const equippedItemId = useGameStore((s) => s.equippedItemId);
  const inventoryItems = useGameStore((s) => s.inventoryItems);
  const weaponCooldown = useGameStore((s) => s.weaponCooldown);

  let pendingDisplay: string | null = null;
  if (pendingVisualInner === 'i') pendingDisplay = 'vi_';
  else if (pendingVisualInner === '(' || pendingVisualInner === '{') {
    pendingDisplay = `vi${pendingVisualInner}_`;
  }
  if (pendingKey === 'g') {
    pendingDisplay = pendingDisplay ? `${pendingDisplay} g_` : 'g_';
  }

  const dirArrow = playerDir.dx === 1 ? '>' : playerDir.dx === -1 ? '<' : playerDir.dy === 1 ? 'v' : '^';

  let weaponDisplay: string | null = null;
  if (equippedItemId) {
    const item = inventoryItems.find((i) => i.id === equippedItemId);
    if (item?.weapon) {
      const w = item.weapon;
      const status = w.ammoType === 'ammo' ? `${item.count}` : (weaponCooldown > 0 ? `CD:${weaponCooldown}` : 'RDY');
      weaponDisplay = `${w.projectileChar} ${w.name} ${status}`;
    } else if (item?.consumable) {
      weaponDisplay = `${item.char} ${item.name} x${item.count}`;
    }
  }

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
      {pendingDisplay && (
        <span style={{ color: COLORS.pendingKey, fontWeight: 'bold' }}>
          {pendingDisplay}
        </span>
      )}
      <span style={{ color: COLORS.projectilePlayer, fontWeight: 'bold' }}>{dirArrow}</span>
      {weaponDisplay && (
        <span style={{
          color: COLORS.accent,
          fontSize: '13px',
          border: `1px solid ${COLORS.textDim}`,
          padding: '1px 6px',
        }}>
          {weaponDisplay}
        </span>
      )}
      <HealthBar current={hp} max={maxHP} color={COLORS.hpFull} emptyColor={COLORS.hpEmpty} label="HP" />
      <HealthBar current={mp} max={maxMP} color={COLORS.mpFull} emptyColor={COLORS.mpEmpty} label="MP" />
      <span style={{ color: COLORS.textDim, marginLeft: 'auto' }}>
        Tutorial {currentLevel}
      </span>
    </div>
  );
}
