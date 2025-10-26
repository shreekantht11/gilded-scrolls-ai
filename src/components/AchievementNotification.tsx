import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Medal, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'medal' | 'award';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  medal: Medal,
  award: Award,
};

const rarityColors = {
  bronze: 'from-orange-600 to-orange-400',
  silver: 'from-gray-400 to-gray-200',
  gold: 'from-yellow-600 to-yellow-400',
  platinum: 'from-purple-600 to-purple-400',
};

export const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  const Icon = iconMap[achievement.icon];

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-20 right-4 z-50"
    >
      <div className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} p-1 rounded-lg shadow-2xl`}>
        <div className="bg-card rounded-lg p-4 min-w-[320px]">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <Icon className="w-12 h-12 text-primary" />
            </motion.div>
            
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                Achievement Unlocked!
              </p>
              <h4 className="font-bold text-foreground mb-1">{achievement.title}</h4>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Achievement Gallery Modal
export const AchievementGallery = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const achievements: Achievement[] = [
    {
      id: 'first_steps',
      title: 'First Steps',
      description: 'Complete the tutorial',
      icon: 'star',
      rarity: 'bronze',
      unlocked: true,
    },
    {
      id: 'warrior',
      title: 'Mighty Warrior',
      description: 'Defeat 10 enemies',
      icon: 'trophy',
      rarity: 'silver',
      unlocked: true,
      progress: 10,
      maxProgress: 10,
    },
    {
      id: 'explorer',
      title: 'World Explorer',
      description: 'Discover all locations',
      icon: 'medal',
      rarity: 'gold',
      unlocked: false,
      progress: 3,
      maxProgress: 5,
    },
    {
      id: 'legend',
      title: 'Living Legend',
      description: 'Reach level 20',
      icon: 'award',
      rarity: 'platinum',
      unlocked: false,
      progress: 1,
      maxProgress: 20,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border-2 border-primary rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        >
          <h2 className="text-2xl font-bold text-primary mb-6">🏆 Achievements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = iconMap[achievement.icon];
              return (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.unlocked
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-muted/50 border-muted opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-8 h-8 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      
                      {achievement.progress !== undefined && achievement.maxProgress && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded capitalize ${
                          achievement.rarity === 'platinum' ? 'bg-purple-500/20 text-purple-400' :
                          achievement.rarity === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                          achievement.rarity === 'silver' ? 'bg-gray-400/20 text-gray-300' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {achievement.rarity}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementNotification;
