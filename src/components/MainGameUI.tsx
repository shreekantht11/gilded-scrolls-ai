import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import AdventureLogModal from '@/components/AdventureLogModal';
import InventoryModal from '@/components/InventoryModal';
import { toast } from 'sonner';
import {
  Sword,
  Shield,
  Package,
  Heart,
  Zap,
  Book,
  ArrowUp,
  Play,
  Settings,
  LogOut,
  Save,
  HelpCircle,
  Menu,
} from 'lucide-react';

const MainGameUI = () => {
  const {
    player,
    currentStory,
    playerChoices,
    inCombat,
    currentEnemy,
    updateStory,
    setPlayerChoices,
    setScreen,
    resetGame,
  } = useGameStore();

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAdventureLog, setShowAdventureLog] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Initial story
  useEffect(() => {
    const initialStory = `You stand at the entrance of an ancient dungeon. The air is thick with mystery, and the flickering torchlight casts dancing shadows on the stone walls. The path ahead splits into three directions...`;
    updateStory(initialStory);
    setPlayerChoices([
      'Explore the left corridor',
      'Investigate the center passage',
      'Take the right pathway',
    ]);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!currentStory) return;
    
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < currentStory.length) {
        setDisplayedText((prev) => prev + currentStory[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentStory]);

  const handleChoice = (choice: string) => {
    // Placeholder: In production, this would call the backend API
    const mockResponse = `You chose to ${choice.toLowerCase()}. As you venture forward, you encounter a mysterious figure shrouded in shadow. The figure speaks in a deep, resonant voice...`;
    updateStory(mockResponse);
    setPlayerChoices([
      'Approach cautiously',
      'Draw your weapon',
      'Retreat quietly',
    ]);
  };

  const handleSaveGame = () => {
    // Placeholder: In production, save to MongoDB
    localStorage.setItem('gameState', JSON.stringify(useGameStore.getState()));
    toast.success('Game saved successfully!');
  };

  const handleExitGame = () => {
    if (window.confirm('Are you sure you want to exit? Make sure to save your progress!')) {
      setScreen('intro');
    }
  };

  const handleOpenSettings = () => {
    setScreen('settings');
  };

  const handleHelp = () => {
    toast.info('Controls: Use the action buttons below to interact with the game. Make choices to progress your story!', {
      duration: 5000,
    });
  };

  if (!player) return null;

  const healthPercentage = (player.health / player.maxHealth) * 100;
  const xpPercentage = (player.xp / player.maxXp) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Modals */}
      <AdventureLogModal
        isOpen={showAdventureLog}
        onClose={() => setShowAdventureLog(false)}
      />
      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
      />

      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${dungeonBg})` }}
        />
        <div className="absolute inset-0 bg-background/75" />
      </motion.div>

      {/* Main Game Container */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top HUD */}
        <div className="p-4 bg-card/90 backdrop-blur-sm border-b-2 border-primary/30">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Player Info */}
              <div>
                <h2 className="text-2xl font-fantasy text-primary">{player.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Level {player.level} {player.class}
                </p>
              </div>

              {/* Health Bar */}
              <div className="min-w-48">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold">
                    {player.health}/{player.maxHealth}
                  </span>
                </div>
                <Progress value={healthPercentage} className="h-3 bg-muted" />
              </div>

              {/* XP Bar */}
              <div className="min-w-48">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">
                    XP: {player.xp}/{player.maxXp}
                  </span>
                </div>
                <Progress value={xpPercentage} className="h-3 bg-muted" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowInventory(true)}
                title="Inventory"
              >
                <Package className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={() => setShowAdventureLog(true)}
                title="Adventure Log"
              >
                <Book className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={handleSaveGame}
                title="Save Game"
              >
                <Save className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={handleHelp}
                title="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/10"
                onClick={handleOpenSettings}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-destructive/20 border-destructive/30"
                onClick={handleExitGame}
                title="Exit Game"
              >
                <LogOut className="w-5 h-5 text-destructive" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 container mx-auto p-4 flex gap-4">
          {/* Story Panel (Left) */}
          <Card className="flex-1 panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
              <Book className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-fantasy text-primary">The Tale Unfolds</h3>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert font-elegant text-lg leading-relaxed"
              >
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-primary"
                  >
                    |
                  </motion.span>
                )}
              </motion.div>
            </ScrollArea>

            {/* Player Choices */}
            {!isTyping && playerChoices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 mt-6 pt-6 border-t border-border"
              >
                <p className="text-sm text-muted-foreground font-semibold mb-3">
                  What will you do?
                </p>
                {playerChoices.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="w-full justify-start text-left h-auto py-4 px-6 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary transition-all duration-300 group"
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                    <span className="font-elegant text-base">{choice}</span>
                  </Button>
                ))}
              </motion.div>
            )}
          </Card>

          {/* Stats & Actions Panel (Right) */}
          <div className="w-80 space-y-4">
            {/* Character Stats */}
            <Card className="panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-4">
              <h3 className="text-lg font-fantasy text-primary mb-4">Character Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Strength</span>
                  <span className="font-semibold text-primary">
                    {player.stats.strength}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Intelligence</span>
                  <span className="font-semibold text-primary">
                    {player.stats.intelligence}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Agility</span>
                  <span className="font-semibold text-primary">
                    {player.stats.agility}
                  </span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <Card className="panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-4">
              <h3 className="text-lg font-fantasy text-primary mb-4">Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-destructive/20 border-destructive/30"
                  onClick={() => toast.info('Combat action - Coming soon!')}
                >
                  <Sword className="w-6 h-6" />
                  <span className="text-xs">Attack</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-secondary/20 border-secondary/30"
                  onClick={() => toast.info('Defense action - Coming soon!')}
                >
                  <Shield className="w-6 h-6" />
                  <span className="text-xs">Defend</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/20 border-primary/30"
                  onClick={() => setShowInventory(true)}
                >
                  <Package className="w-6 h-6" />
                  <span className="text-xs">Use Item</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-accent/20 border-accent/30"
                  onClick={() => toast.info('Jump action - Coming soon!')}
                >
                  <ArrowUp className="w-6 h-6" />
                  <span className="text-xs">Jump</span>
                </Button>
              </div>
            </Card>

            {/* Inventory Preview */}
            <Card className="panel-glow bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-4">
              <h3 className="text-lg font-fantasy text-primary mb-4">Inventory</h3>
              {player.inventory.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  Your inventory is empty
                </p>
              ) : (
                <div className="space-y-2">
                  {player.inventory.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainGameUI;
