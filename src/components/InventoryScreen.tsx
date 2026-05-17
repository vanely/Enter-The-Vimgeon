import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';

export function InventoryScreen() {
  const inventoryOpen = useGameStore((s) => s.inventoryOpen);
  const inventoryItems = useGameStore((s) => s.inventoryItems);
  const inventoryCursor = useGameStore((s) => s.inventoryCursor);
  const equippedItemId = useGameStore((s) => s.equippedItemId);

  if (!inventoryOpen) return null;

  const quickSlots = [1, 2, 3].map((slot) => {
    const item = inventoryItems.find((i) => i.quickSlot === slot);
    return { slot, item: item || null };
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      }}
    >
      <div
        style={{
          border: `2px solid ${COLORS.helpBorder}`,
          backgroundColor: COLORS.helpBg,
          padding: '24px',
          minWidth: '400px',
          maxWidth: '500px',
          boxShadow: `0 0 20px ${COLORS.helpBorder}40`,
        }}
      >
        <div
          style={{
            color: COLORS.helpTitle,
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '16px',
            textAlign: 'center',
            borderBottom: `1px solid ${COLORS.textDim}`,
            paddingBottom: '8px',
          }}
        >
          INVENTORY
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: COLORS.textDim, fontSize: '12px', marginBottom: '8px' }}>
            QUICK SLOTS
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {quickSlots.map(({ slot, item }) => (
              <div
                key={slot}
                style={{
                  border: `1px solid ${item ? COLORS.accent : COLORS.textDim}`,
                  padding: '4px 8px',
                  minWidth: '80px',
                  textAlign: 'center',
                  color: item ? COLORS.text : COLORS.textDim,
                  fontSize: '13px',
                }}
              >
                <div style={{ color: COLORS.textDim, fontSize: '10px' }}>[{slot}]</div>
                {item ? (
                  <div>
                    <span style={{ color: COLORS.keyItem }}>{item.char}</span> {item.name}
                  </div>
                ) : (
                  <div>empty</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ color: COLORS.textDim, fontSize: '12px', marginBottom: '8px' }}>
          ITEMS
        </div>

        {inventoryItems.length === 0 ? (
          <div style={{ color: COLORS.textDim, fontSize: '13px', padding: '8px 0' }}>
            No items collected yet.
          </div>
        ) : (
          <div>
            {inventoryItems.map((item, i) => (
              <div
                key={item.id}
                style={{
                  padding: '4px 8px',
                  backgroundColor: i === inventoryCursor ? COLORS.helpHighlight : 'transparent',
                  color: i === inventoryCursor ? COLORS.text : COLORS.textDim,
                  fontSize: '13px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: i === inventoryCursor ? COLORS.accent : COLORS.textDim }}>
                  {i === inventoryCursor ? '>' : ' '}
                </span>
                <span style={{ color: COLORS.keyItem }}>{item.char}</span>
                {(item.weapon || item.consumable) && (
                  <span style={{
                    color: equippedItemId === item.id ? COLORS.doorOpen : COLORS.modeVisual,
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}>
                    {equippedItemId === item.id ? '[E]' : item.weapon ? '[W]' : '[+]'}
                  </span>
                )}
                <span>{item.name}</span>
                {item.weapon && item.weapon.ammoType === 'ammo' ? (
                  <span style={{ color: COLORS.textDim }}>x{item.count}</span>
                ) : item.consumable ? (
                  <span style={{ color: COLORS.textDim }}>x{item.count}</span>
                ) : item.count > 1 ? (
                  <span style={{ color: COLORS.textDim }}>x{item.count}</span>
                ) : null}
                {item.quickSlot && (
                  <span style={{ color: COLORS.accent, marginLeft: 'auto' }}>[{item.quickSlot}]</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: '16px',
            borderTop: `1px solid ${COLORS.textDim}`,
            paddingTop: '8px',
            color: COLORS.textDim,
            fontSize: '11px',
          }}
        >
          j/k navigate | e equip item | 1-3 quick slot | Esc/:q close
        </div>
      </div>
    </div>
  );
}
