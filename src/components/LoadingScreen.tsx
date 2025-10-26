import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const TIPS = [
  'Explore every choice - your decisions shape the story',
  'Use items wisely during combat for maximum effect',
  'Level up your character to unlock powerful abilities',
  'Complete side quests for unique rewards',
  'Save your game regularly to protect your progress',
  'Different character classes have unique storylines',
  'Hidden secrets await those who explore thoroughly',
  'Combat strategy matters - choose actions carefully',
  'Your character\'s stats affect dialogue options',
  'Multiple endings based on your choices',
];

interface LoadingScreenProps {
  message?: string;
  showTips?: boolean;
}

const LoadingScreen = ({ message = 'Loading...', showTips = true }: LoadingScreenProps) => {
  const [currentTip, setCurrentTip] = useState(TIPS[0]);

  useEffect(() => {
    if (!showTips) return;

    const interval = setInterval(() => {
      setCurrentTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [showTips]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-6 px-4 max-w-md">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-16 h-16 mx-auto text-primary" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-foreground">{message}</h2>
        
        {showTips && (
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <p className="text-sm text-muted-foreground italic">💡 Tip: {currentTip}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
