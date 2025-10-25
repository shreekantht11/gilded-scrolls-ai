import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import dungeonBg from '@/assets/dungeon-bg.jpg';
import desertBg from '@/assets/desert-bg.jpg';
import forestBg from '@/assets/forest-bg.jpg';
import { Castle, Rocket, Search, Sparkles } from 'lucide-react';

const genres = [
  {
    name: 'Fantasy',
    icon: Castle,
    description: 'Explore mystical realms filled with magic and ancient secrets',
    image: dungeonBg,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    name: 'Sci-Fi',
    icon: Rocket,
    description: 'Journey through futuristic worlds and advanced civilizations',
    image: desertBg,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'Mystery',
    icon: Search,
    description: 'Unravel enigmatic puzzles and hidden conspiracies',
    image: forestBg,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    name: 'Mythical',
    icon: Sparkles,
    description: 'Walk among gods and legendary creatures of old',
    image: forestBg,
    color: 'from-rose-500 to-pink-600',
  },
] as const;

const GenreSelection = () => {
  const { setGenre, setScreen } = useGameStore();

  const handleSelectGenre = (genre: typeof genres[number]['name']) => {
    setGenre(genre);
    setScreen('game');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-fantasy gold-shimmer text-glow mb-4">
            Choose Your Realm
          </h1>
          <p className="text-xl text-muted-foreground font-elegant">
            Select the world where your adventure begins
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {genres.map((genre, index) => {
            const Icon = genre.icon;
            return (
              <motion.div
                key={genre.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="group relative overflow-hidden cursor-pointer border-2 border-primary/30 hover:border-primary transition-all duration-500 h-80"
                  onClick={() => handleSelectGenre(genre.name)}
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${genre.image})` }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-60 group-hover:opacity-75 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative h-full p-8 flex flex-col justify-end">
                    <motion.div
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-16 h-16 text-white mb-4 drop-shadow-lg" />
                    </motion.div>
                    
                    <h2 className="text-4xl font-fantasy text-white mb-3 drop-shadow-lg">
                      {genre.name}
                    </h2>
                    
                    <p className="text-white/90 font-elegant text-lg drop-shadow-md">
                      {genre.description}
                    </p>
                    
                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 border-4 border-primary/0 group-hover:border-primary/50 rounded-lg transition-all duration-500"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                  </div>
                  
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GenreSelection;
