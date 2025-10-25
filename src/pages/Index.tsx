import { useGameStore } from '@/store/gameStore';
import IntroScreen from '@/components/IntroScreen';
import CharacterSetup from '@/components/CharacterSetup';
import GenreSelection from '@/components/GenreSelection';
import MainGameUI from '@/components/MainGameUI';
import Settings from '@/components/Settings';

const Index = () => {
  const currentScreen = useGameStore((state) => state.currentScreen);

  return (
    <div className="min-h-screen">
      {currentScreen === 'intro' && <IntroScreen />}
      {currentScreen === 'character' && <CharacterSetup />}
      {currentScreen === 'genre' && <GenreSelection />}
      {currentScreen === 'game' && <MainGameUI />}
      {currentScreen === 'settings' && <Settings />}
    </div>
  );
};

export default Index;
