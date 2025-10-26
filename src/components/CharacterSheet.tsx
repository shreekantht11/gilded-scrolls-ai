import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sword, Shield, Zap, Heart, Star, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CharacterSheet = () => {
  const { t } = useTranslation();
  const player = useGameStore(state => state.player);

  if (!player) return null;

  const healthPercent = (player.health / player.maxHealth) * 100;
  const xpPercent = (player.xp / player.maxXp) * 100;

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {/* Character Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-4xl">
            {player.class === 'Warrior' ? '⚔️' : player.class === 'Mage' ? '🧙' : '🗡️'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{player.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge>{player.class}</Badge>
              <Badge variant="outline">Level {player.level}</Badge>
              <Badge variant="secondary">{player.gender}</Badge>
            </div>
          </div>
        </motion.div>

        <Separator />

        {/* Health & XP */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                <Heart className="w-4 h-4 text-destructive" />
                Health
              </span>
              <span className="text-sm text-muted-foreground">
                {player.health}/{player.maxHealth}
              </span>
            </div>
            <Progress value={healthPercent} className="h-3" />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                <Star className="w-4 h-4 text-primary" />
                Experience
              </span>
              <span className="text-sm text-muted-foreground">
                {player.xp}/{player.maxXp}
              </span>
            </div>
            <Progress value={xpPercent} className="h-3" />
          </div>
        </div>

        <Separator />

        {/* Stats */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Character Stats
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-card border border-border rounded-lg p-4 text-center"
            >
              <Sword className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <p className="text-2xl font-bold text-foreground">{player.stats.strength}</p>
              <p className="text-xs text-muted-foreground">Strength</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-card border border-border rounded-lg p-4 text-center"
            >
              <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{player.stats.intelligence}</p>
              <p className="text-xs text-muted-foreground">Intelligence</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-card border border-border rounded-lg p-4 text-center"
            >
              <Shield className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold text-foreground">{player.stats.agility}</p>
              <p className="text-xs text-muted-foreground">Agility</p>
            </motion.div>
          </div>
        </div>

        <Separator />

        {/* Equipment */}
        <div>
          <h3 className="font-semibold mb-3">Equipment</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Weapon', 'Armor', 'Helmet', 'Boots'].map((slot) => (
              <div
                key={slot}
                className="bg-muted/50 border border-dashed border-border rounded-lg p-4 text-center"
              >
                <p className="text-xs text-muted-foreground mb-1">{slot}</p>
                <p className="text-sm">Empty</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Abilities */}
        <div>
          <h3 className="font-semibold mb-3">Class Abilities</h3>
          <div className="space-y-2">
            {player.class === 'Warrior' && (
              <>
                <AbilityCard name="Power Strike" description="Deal 150% damage" level={1} />
                <AbilityCard name="Shield Bash" description="Stun enemy for 1 turn" level={1} locked />
              </>
            )}
            {player.class === 'Mage' && (
              <>
                <AbilityCard name="Fireball" description="Area damage to all enemies" level={1} />
                <AbilityCard name="Arcane Shield" description="Absorb incoming damage" level={1} locked />
              </>
            )}
            {player.class === 'Rogue' && (
              <>
                <AbilityCard name="Backstab" description="Critical strike from behind" level={1} />
                <AbilityCard name="Shadow Step" description="Dodge next attack" level={1} locked />
              </>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

const AbilityCard = ({ name, description, level, locked }: any) => (
  <div className={`bg-card border border-border rounded-lg p-3 ${locked ? 'opacity-50' : ''}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {locked ? (
        <Badge variant="outline" className="text-xs">🔒 Locked</Badge>
      ) : (
        <Badge className="text-xs">Lv {level}</Badge>
      )}
    </div>
  </div>
);

export default CharacterSheet;
