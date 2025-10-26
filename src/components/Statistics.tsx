import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sword, Trophy, MapPin, Package, Clock, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatisticsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Statistics = ({ isOpen, onClose }: StatisticsProps) => {
  const { t } = useTranslation();
  const player = useGameStore(state => state.player);
  const storyLog = useGameStore(state => state.storyLog);

  // Mock statistics - in production, these would be tracked
  const stats = {
    playTime: '2h 34m',
    enemiesDefeated: 15,
    questsCompleted: 3,
    questsActive: 2,
    locationsDiscovered: 3,
    locationsTotal: 5,
    itemsCollected: 8,
    choicesMade: 42,
    damageDealt: 1250,
    damageTaken: 680,
    potionsUsed: 5,
    deathCount: 1,
  };

  if (!isOpen || !player) return null;

  const explorationPercent = (stats.locationsDiscovered / stats.locationsTotal) * 100;

  return (
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
        className="bg-card border-2 border-primary rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-hidden"
      >
        <h2 className="text-2xl font-bold text-primary mb-6">📊 Adventure Statistics</h2>

        <ScrollArea className="h-[calc(85vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Clock className="w-6 h-6" />}
                label="Play Time"
                value={stats.playTime}
                color="text-blue-400"
              />
              <StatCard
                icon={<Sword className="w-6 h-6" />}
                label="Enemies Defeated"
                value={stats.enemiesDefeated}
                color="text-red-400"
              />
              <StatCard
                icon={<Trophy className="w-6 h-6" />}
                label="Quests Done"
                value={stats.questsCompleted}
                color="text-yellow-400"
              />
              <StatCard
                icon={<Package className="w-6 h-6" />}
                label="Items Found"
                value={stats.itemsCollected}
                color="text-green-400"
              />
            </div>

            <Separator />

            {/* Combat Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sword className="w-5 h-5 text-destructive" />
                Combat Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Damage Dealt</p>
                  <p className="text-2xl font-bold text-destructive">{stats.damageDealt}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Damage Taken</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.damageTaken}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Potions Used</p>
                  <p className="text-2xl font-bold text-green-400">{stats.potionsUsed}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Deaths</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.deathCount}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Exploration */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Exploration Progress
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Locations Discovered</span>
                    <span className="text-sm font-semibold">
                      {stats.locationsDiscovered}/{stats.locationsTotal}
                    </span>
                  </div>
                  <Progress value={explorationPercent} className="h-3" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Quest Progress */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Quest Progress
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Active Quests</p>
                  <p className="text-3xl font-bold text-primary">{stats.questsActive}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Completed Quests</p>
                  <p className="text-3xl font-bold text-green-400">{stats.questsCompleted}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Player Milestones */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Milestones</h3>
              <div className="space-y-2">
                {storyLog.slice(-5).reverse().map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-muted/50 rounded-lg p-3"
                  >
                    <p className="text-sm">{event.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-card border border-border rounded-lg p-4 text-center"
  >
    <div className={`${color} mb-2 flex justify-center`}>{icon}</div>
    <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

export default Statistics;
