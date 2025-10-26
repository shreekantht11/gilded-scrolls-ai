import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface Location {
  id: string;
  name: string;
  description: string;
  discovered: boolean;
  unlocked: boolean;
  level: number;
  icon: string;
  x: number;
  y: number;
}

const WorldMap = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const player = useGameStore(state => state.player);
  const currentLocation = useGameStore(state => state.currentLocation || 'village');

  const locations: Location[] = [
    {
      id: 'village',
      name: 'Starting Village',
      description: 'A peaceful village where your journey began',
      discovered: true,
      unlocked: true,
      level: 1,
      icon: '🏘️',
      x: 20,
      y: 50,
    },
    {
      id: 'forest',
      name: 'Dark Forest',
      description: 'An ancient forest filled with mysteries',
      discovered: true,
      unlocked: true,
      level: 3,
      icon: '🌲',
      x: 40,
      y: 40,
    },
    {
      id: 'cave',
      name: 'Crystal Caves',
      description: 'Glowing crystals illuminate these dangerous caverns',
      discovered: true,
      unlocked: player ? player.level >= 5 : false,
      level: 5,
      icon: '⛰️',
      x: 60,
      y: 30,
    },
    {
      id: 'castle',
      name: 'Abandoned Castle',
      description: 'Once majestic, now haunted ruins',
      discovered: player ? player.level >= 7 : false,
      unlocked: player ? player.level >= 7 : false,
      level: 7,
      icon: '🏰',
      x: 75,
      y: 45,
    },
    {
      id: 'mountain',
      name: 'Dragon Peak',
      description: 'The highest mountain, home to ancient dragons',
      discovered: player ? player.level >= 10 : false,
      unlocked: player ? player.level >= 10 : false,
      level: 10,
      icon: '🗻',
      x: 85,
      y: 20,
    },
  ];

  const handleTravel = (location: Location) => {
    if (!location.unlocked) {
      toast({
        title: 'Location Locked',
        description: `Reach level ${location.level} to unlock this area.`,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Traveling...',
      description: `Heading to ${location.name}`,
    });

    // In a real implementation, this would trigger a story event
  };

  return (
    <div className="space-y-6">
      {/* Map Canvas */}
      <div className="relative w-full h-[400px] bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg border-2 border-border overflow-hidden">
        {/* Path Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {locations.slice(0, -1).map((loc, i) => {
            const nextLoc = locations[i + 1];
            return (
              <motion.line
                key={`path-${loc.id}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: nextLoc.discovered ? 1 : 0 }}
                transition={{ duration: 1, delay: i * 0.2 }}
                x1={`${loc.x}%`}
                y1={`${loc.y}%`}
                x2={`${nextLoc.x}%`}
                y2={`${nextLoc.y}%`}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            );
          })}
        </svg>

        {/* Location Markers */}
        {locations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: location.discovered ? 1 : 0, opacity: location.discovered ? 1 : 0 }}
            transition={{ delay: index * 0.2 }}
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => handleTravel(location)}
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              className={`relative ${currentLocation === location.id ? 'animate-pulse' : ''}`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 ${
                  currentLocation === location.id
                    ? 'border-primary bg-primary/20'
                    : location.unlocked
                    ? 'border-primary/50 bg-background'
                    : 'border-muted bg-muted/50'
                }`}
              >
                {location.unlocked ? location.icon : <Lock className="w-8 h-8 text-muted-foreground" />}
              </div>

              {currentLocation === location.id && (
                <MapPin className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 text-primary animate-bounce" />
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Location List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((location) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-card border rounded-lg p-4 space-y-3 ${
              !location.discovered ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{location.discovered ? location.icon : '❓'}</span>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {location.discovered ? location.name : 'Unknown Location'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {location.discovered ? location.description : 'Not yet discovered'}
                  </p>
                </div>
              </div>
              {currentLocation === location.id && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <Badge variant={location.unlocked ? 'default' : 'secondary'}>
                Level {location.level}
              </Badge>

              <Button
                size="sm"
                disabled={!location.unlocked || currentLocation === location.id}
                onClick={() => handleTravel(location)}
              >
                {currentLocation === location.id ? 'Current' : location.unlocked ? 'Travel' : 'Locked'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorldMap;
