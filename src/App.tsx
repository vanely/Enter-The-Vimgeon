import { useEffect } from 'react';
import { useGameStore, initTutorialLevels } from './engine/gameState';
import { handleKeyDown, handleKeyUp } from './engine/input';
import { startLoop, stopLoop } from './engine/gameLoop';
import { tutorialLevels } from './data/rooms/tutorial';
import { act1Levels } from './data/rooms/act1';
import { GameGrid } from './components/GameGrid';
import { HUD } from './components/HUD';
import { MessageLog } from './components/MessageLog';
import { CommandLine } from './components/CommandLine';
import { SignPopup } from './components/SignPopup';
import { HelpMenu } from './components/HelpMenu';
import { TutorialHint } from './components/TutorialHint';
import { TitleScreen } from './components/TitleScreen';
import { Minimap } from './components/Minimap';
import { DeathScreen } from './components/DeathScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { COLORS } from './utils/colors';

initTutorialLevels([...tutorialLevels, ...act1Levels]);

export default function App() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const startGame = useGameStore((s) => s.startGame);
  const enemies = useGameStore((s) => s.enemies);
  const projectiles = useGameStore((s) => s.projectiles);
  const playerDead = useGameStore((s) => s.playerDead);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const hasLightPulse = useGameStore((s) =>
    s.projectiles.some((p) => p.owner === 'light'),
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!gameStarted) {
        startGame();
        e.preventDefault();
        return;
      }
      handleKeyDown(e);
    }

    function onKeyUp(e: KeyboardEvent) {
      handleKeyUp(e);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameStarted, startGame]);

  useEffect(() => {
    const hasActiveEnemies = enemies.some((e) => !e.dead);
    const hasProjectiles = projectiles.length > 0;
    const lightPuzzleActive = Boolean(currentRoom?.lightPuzzle && hasLightPulse);

    if ((hasActiveEnemies || hasProjectiles || lightPuzzleActive) && !playerDead) {
      startLoop();
    } else {
      stopLoop();
    }

    return () => {
      stopLoop();
    };
  }, [enemies, projectiles, playerDead, currentRoom, hasLightPulse]);

  if (!gameStarted) {
    return <TitleScreen />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: COLORS.bg,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <HUD />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '90%',
            height: '90%',
            maxWidth: '100%',
            maxHeight: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <GameGrid />
          <Minimap />
          <SignPopup />
          <TutorialHint />
        </div>
        <DeathScreen />
        <InventoryScreen />
      </div>
      <CommandLine />
      <MessageLog />
      <HelpMenu />
    </div>
  );
}
