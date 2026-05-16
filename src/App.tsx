import { useEffect } from 'react';
import { useGameStore, initTutorialLevels } from './engine/gameState';
import { handleKeyDown, handleKeyUp } from './engine/input';
import { tutorialLevels } from './data/rooms/tutorial';
import { GameGrid } from './components/GameGrid';
import { HUD } from './components/HUD';
import { MessageLog } from './components/MessageLog';
import { CommandLine } from './components/CommandLine';
import { SignPopup } from './components/SignPopup';
import { HelpMenu } from './components/HelpMenu';
import { TutorialHint } from './components/TutorialHint';
import { TitleScreen } from './components/TitleScreen';
import { COLORS } from './utils/colors';

initTutorialLevels(tutorialLevels);

export default function App() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const startGame = useGameStore((s) => s.startGame);

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
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <GameGrid />
        <SignPopup />
        <TutorialHint />
      </div>
      <CommandLine />
      <MessageLog />
      <HelpMenu />
    </div>
  );
}
