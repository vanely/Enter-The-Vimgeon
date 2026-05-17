import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';

export function MessageLog() {
  const messages = useGameStore((s) => s.messages);
  const nearbyItem = useGameStore((s) => s.nearbyItem);
  const mode = useGameStore((s) => s.mode);
  const inventoryItems = useGameStore((s) => s.inventoryItems);
  const containers = useGameStore((s) => s.containers);
  const playerPos = useGameStore((s) => s.playerPos);


  const nearbyContainer = containers.find(
    (c) => !c.opened &&
      Math.abs(c.pos.x - playerPos.x) <= 2 &&
      Math.abs(c.pos.y - playerPos.y) <= 1
  );

  const recentMessages = messages.slice(-3);

  return (
    <div
      style={{
        padding: '6px 12px',
        backgroundColor: COLORS.bgAlt,
        borderTop: `1px solid ${COLORS.textDim}`,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: '13px',
        color: COLORS.text,
        minHeight: '80px',
      }}
    >
      {nearbyItem && mode === 'NORMAL' && (
        <div style={{ color: COLORS.keyItem, fontWeight: 'bold', marginBottom: '2px' }}>
          &gt; [{nearbyItem.name}] Press <span style={{ color: COLORS.modeVisual }}>v</span> then <span style={{ color: COLORS.modeVisual }}>y</span> to pick up
        </div>
      )}
      {nearbyItem && mode === 'VISUAL' && (
        <div style={{ color: COLORS.modeVisual, fontWeight: 'bold', marginBottom: '2px' }}>
          &gt; VISUAL: [{nearbyItem.name}] selected -- press <span style={{ color: COLORS.accent }}>y</span> to yank
        </div>
      )}
      {!nearbyItem && nearbyContainer && mode === 'NORMAL' && (
        <div style={{ color: COLORS.barrel, fontWeight: 'bold', marginBottom: '2px' }}>
          &gt; [{nearbyContainer.bracketType === '(' ? 'Barrel' : 'Chest'}] Use <span style={{ color: COLORS.modeVisual }}>vi{nearbyContainer.bracketType}y</span> to loot (Shift required)
        </div>
      )}
      {recentMessages.map((msg, i) => (
        <div
          key={msg.timestamp + i}
          style={{
            color: msg.color || COLORS.text,
            opacity: i === recentMessages.length - 1 ? 1 : 0.6,
          }}
        >
          &gt; {msg.text}
        </div>
      ))}
      {recentMessages.length === 0 && !nearbyItem && !nearbyContainer && (
        <div style={{ color: COLORS.textDim }}>&gt; ...</div>
      )}
      {inventoryItems.length > 0 && (
        <div style={{ color: COLORS.textDim, marginTop: '4px', borderTop: `1px solid ${COLORS.textDim}`, paddingTop: '2px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>Items: {inventoryItems.map((item) => `${item.char}${item.count > 1 ? `x${item.count}` : ''}`).join(' ')}</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px' }}>:inv</span>
        </div>
      )}
    </div>
  );
}
