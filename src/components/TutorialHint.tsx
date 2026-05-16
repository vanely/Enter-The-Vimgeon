import { useEffect, useRef } from 'react';
import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';

export function TutorialHint() {
  const hintVisible = useGameStore((s) => s.hintVisible);
  const hintText = useGameStore((s) => s.hintText);
  const lastInputTime = useGameStore((s) => s.lastInputTime);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const showHint = useGameStore((s) => s.showHint);
  const helpOpen = useGameStore((s) => s.helpOpen);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!currentRoom?.hintText || !currentRoom?.hintDelay || helpOpen) return;

    timerRef.current = setTimeout(() => {
      const now = Date.now();
      const elapsed = now - lastInputTime;
      if (elapsed >= (currentRoom.hintDelay || 8000)) {
        showHint(currentRoom.hintText || '');
      }
    }, currentRoom.hintDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastInputTime, currentRoom, helpOpen, showHint]);

  if (!hintVisible || !hintText) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: '13px',
        color: COLORS.accent,
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        border: `1px solid ${COLORS.accent}`,
        padding: '8px 16px',
        borderRadius: '4px',
        animation: 'fadeIn 0.5s ease-in',
      }}
    >
      Hint: {hintText}
    </div>
  );
}
