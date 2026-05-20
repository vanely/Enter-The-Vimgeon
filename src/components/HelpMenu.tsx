import { useMemo } from 'react';
import { useGameStore } from '../engine/gameState';
import { COLORS } from '../utils/colors';
import { helpPages, helpSections } from '../data/help/controls';
import { ENEMY_ARCHETYPES } from '../data/enemies';

export function HelpMenu() {
  const helpOpen = useGameStore((s) => s.helpOpen);
  const helpSection = useGameStore((s) => s.helpSection);
  const helpCursor = useGameStore((s) => s.helpCursor);
  const encountered = useGameStore((s) => s.encounteredEnemies);
  const runMode = useGameStore((s) => s.runMode);

  const page = useMemo(() => {
    const base = helpPages[helpSection];
    if (!base) return base;
    if (helpSection === 'bestiary' && encountered.size > 0) {
      const lines = [
        '',
        '  CREATURES RECORDED THIS RUN',
        '',
        ...Array.from(encountered).map((id) => {
          const a = ENEMY_ARCHETYPES[id];
          if (!a) return `  (unknown: ${id})`;
          return `  ${a.name} — ${a.maxHp} HP — ${a.ai}`;
        }),
        '',
        '  Press Esc to go back',
        '',
      ];
      return { title: base.title, lines };
    }
    if (helpSection === 'map' && runMode === 'dungeon') {
      return {
        title: base.title,
        lines: [
          '',
          '  REGION MAP (HUD corner)',
          '',
          '  While in the procedural dungeon',
          '  a minimap appears top-right.',
          '',
          '  Symbols:',
          '    @  you   #  cleared room',
          '    $  treasure   !  boss',
          '    ?  unexplored   S  start',
          '',
          '  Press Esc to go back',
          '',
        ],
      };
    }
    if (helpSection === 'spells') {
      return {
        title: base.title,
        lines: [
          '',
          '  COMMAND SPELLS',
          '',
          '  :cast fireball',
          '    Costs 3 MP. Launches fire in',
          '    all four cardinal directions.',
          '',
          '  :heal',
          '    Costs 2 MP. Restores 5 HP',
          '    (capped at max HP).',
          '',
          '  :skip-tutorial',
          '    Jump from tutorial straight',
          '    into the procedural dungeon.',
          '',
          '  Press Esc to go back',
          '',
        ],
      };
    }
    return base;
  }, [helpSection, encountered, runMode]);

  if (!helpOpen) return null;

  if (!page) return null;

  const isMain = helpSection === 'main';

  const border = '+' + '='.repeat(56) + '+';
  const titleLine = `|${page.title.padStart(Math.floor((56 + page.title.length) / 2)).padEnd(56)}|`;

  const lines = page.lines.map((line, i) => {
    if (isMain && i >= 3 && i <= 9) {
      const sectionIdx = i - 3;
      const isActive = sectionIdx === helpCursor;
      const prefix = isActive ? '  > ' : '    ';
      const sectionName = helpSections[sectionIdx];
      if (sectionName) {
        const originalLine = line.replace(/^\s{2}(?:>|\s)\s/, '');
        const displayLine = prefix + originalLine;
        return {
          text: `|${displayLine.padEnd(56)}|`,
          highlight: isActive,
        };
      }
    }
    return {
      text: `|${line.padEnd(56)}|`,
      highlight: false,
    };
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
      }}
    >
      <pre
        style={{
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: '14px',
          color: COLORS.text,
          lineHeight: '1.5',
          margin: 0,
          padding: '20px',
          backgroundColor: COLORS.helpBg,
          border: `2px solid ${COLORS.helpBorder}`,
          boxShadow: `0 0 40px rgba(167, 139, 250, 0.2)`,
        }}
      >
        <span style={{ color: COLORS.helpBorder }}>{border}</span>
        {'\n'}
      <span style={{ color: COLORS.helpTitle, fontWeight: 'bold' }}>{titleLine}</span>
        {'\n'}
        <span style={{ color: COLORS.helpBorder }}>{border}</span>
        {'\n'}
        {lines.map((l, i) => (
          <span key={i}>
            <span
              style={{
                color: l.highlight ? COLORS.accent : COLORS.text,
                backgroundColor: l.highlight ? COLORS.helpHighlight : 'transparent',
                fontWeight: l.highlight ? 'bold' : 'normal',
              }}
            >
              {l.text}
            </span>
            {'\n'}
          </span>
        ))}
        <span style={{ color: COLORS.helpBorder }}>{border}</span>
      </pre>
    </div>
  );
}
