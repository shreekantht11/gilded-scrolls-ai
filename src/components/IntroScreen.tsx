import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import { Sword, Play, Settings, BookOpen } from 'lucide-react';

const IntroScreen = () => {
  const setScreen = useGameStore((state) => state.setScreen);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${dungeonBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sword className="w-16 h-16 mx-auto mb-6 text-primary" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-fantasy gold-shimmer text-glow mb-4">
            AI Dungeon Master
          </h1>
          <p className="text-xl md:text-2xl font-elegant text-muted-foreground">
            Where Your Choices Shape Destiny
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col gap-4 w-full max-w-md"
        >
          <Button
            onClick={() => setScreen('character')}
            className="h-16 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Play className="mr-2 group-hover:translate-x-1 transition-transform" />
            Begin Your Journey
          </Button>

          <Button
            variant="secondary"
            className="h-14 text-lg bg-card/80 hover:bg-card border-2 border-primary/30 hover:border-primary/60 transition-all duration-300"
          >
            <BookOpen className="mr-2" />
            Continue Adventure
          </Button>

          <Button
            variant="ghost"
            onClick={() => setScreen('settings')}
            className="h-12 text-base hover:bg-primary/10 transition-all duration-300"
          >
            <Settings className="mr-2" />
            Settings
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 text-center text-sm text-muted-foreground"
        >
          <p className="font-elegant">Powered by Gemini AI · © AI Dungeon Master</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default IntroScreen;
