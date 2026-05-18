import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';
import { EnemyHealthBars } from './EnemyHealthBars';

/** Match monospace cell metrics in `styles` below (px / line-height). */
const CELL_PX = 16;
const LINE_HEIGHT = 1.35;
/** Horizontal: padding 8+8 + border 2+2. Vertical: padding 4+4 + border 2+2. */
const CHROME_H = 20;
const CHROME_V = 12;

function computeViewport(
  gw: number,
  gh: number,
  px: number,
  py: number,
  viewW: number,
  viewH: number,
): {
  ox: number;
  oy: number;
  viewCols: number;
  viewRows: number;
  panX: boolean;
  panY: boolean;
} {
  const viewCols = Math.max(24, Math.floor((viewW - CHROME_H) / CELL_PX));
  const viewRows = Math.max(10, Math.floor((viewH - CHROME_V) / (CELL_PX * LINE_HEIGHT)));
  const panX = gw > viewCols;
  const panY = gh > viewRows;
  if ((!panX && !panY) || gw === 0 || gh === 0) {
    return { ox: 0, oy: 0, viewCols, viewRows, panX: false, panY: false };
  }
  let ox = 0;
  let oy = 0;
  if (panX) {
    ox = px - Math.floor(viewCols / 2);
    ox = Math.max(0, Math.min(ox, gw - viewCols));
  }
  if (panY) {
    oy = py - Math.floor(viewRows / 2);
    oy = Math.max(0, Math.min(oy, gh - viewRows));
  }
  return { ox, oy, viewCols, viewRows, panX, panY };
}

export function GameGrid() {
  const renderedGrid = useGameStore((s) => s.renderedGrid);
  const playerPos = useGameStore((s) => s.playerPos);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewPx, setViewPx] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setViewPx({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setViewPx({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const gh = renderedGrid.length;
  const gw = gh > 0 ? renderedGrid[0]!.length : 0;

  const measured = viewPx.w > 48 && viewPx.h > 48;
  const { ox, oy, panX, panY } = useMemo(() => {
    if (!measured) {
      return { ox: 0, oy: 0, panX: false, panY: false };
    }
    return computeViewport(gw, gh, playerPos.x, playerPos.y, viewPx.w, viewPx.h);
  }, [measured, gw, gh, playerPos.x, playerPos.y, viewPx.w, viewPx.h]);

  const needsCamera = panX || panY;

  if (renderedGrid.length === 0) return null;

  return (
    <div
      ref={viewportRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: panY ? 'flex-start' : 'center',
        justifyContent: panX ? 'flex-start' : 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
          fontSize: `${CELL_PX}px`,
          lineHeight: LINE_HEIGHT,
          backgroundColor: COLORS.bg,
          padding: '4px 8px',
          border: `2px solid ${COLORS.helpBorder}`,
          boxShadow: `0 0 20px rgba(167, 139, 250, 0.15)`,
          userSelect: 'none',
          transform: needsCamera
            ? `translate(calc(-${ox} * 1ch), calc(-${oy} * ${LINE_HEIGHT}em))`
            : undefined,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {renderedGrid.map((row, y) => (
            <div key={y} style={{ display: 'flex', whiteSpace: 'pre' }}>
              {row.map((cell, x) => (
                <span
                  key={x}
                  style={{
                    color: cell.fg || COLORS.text,
                    backgroundColor: cell.bg || 'transparent',
                    fontWeight: cell.bold ? 'bold' : 'normal',
                    width: '1ch',
                    textAlign: 'center',
                  }}
                >
                  {cell.char}
                </span>
              ))}
            </div>
          ))}
        </div>
        <EnemyHealthBars />
      </div>
    </div>
  );
}
