import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Package, Sword, Shield, Droplet, Key } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const itemIcons = {
  weapon: Sword,
  armor: Shield,
  potion: Droplet,
  key: Key,
  quest: Package,
};

const InventoryModal = ({ isOpen, onClose }: InventoryModalProps) => {
  const { player, useItem } = useGameStore();

  const handleUseItem = (itemId: string, itemName: string) => {
    useItem(itemId);
    toast.success(`Used ${itemName}!`);
  };

  const inventory = player?.inventory || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-x-[20%] md:inset-y-12 z-50 flex items-center justify-center"
          >
            <Card className="w-full h-full panel-glow bg-card/98 backdrop-blur-md border-2 border-primary/40 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-primary/30">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-3xl font-fantasy gold-shimmer">
                      Inventory
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {inventory.length} items
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-destructive/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                {inventory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Package className="w-20 h-20 text-muted-foreground/30 mb-4" />
                    <p className="text-xl text-muted-foreground font-elegant">
                      Your inventory is empty
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-2">
                      Collect items during your adventure
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory.map((item, index) => {
                      const Icon = itemIcons[item.type];
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="p-4 bg-muted/30 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                  <Icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {item.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {item.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-primary">
                                  ×{item.quantity}
                                </span>
                              </div>
                            </div>

                            {item.effect && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {item.effect}
                              </p>
                            )}

                            {item.type === 'potion' && (
                              <Button
                                onClick={() => handleUseItem(item.id, item.name)}
                                className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/40"
                                variant="outline"
                              >
                                Use Item
                              </Button>
                            )}
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Footer Stats */}
              {player && (
                <div className="p-4 border-t border-border flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-2xl font-fantasy text-primary">
                      {inventory.filter((i) => i.type === 'weapon').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Weapons</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-fantasy text-primary">
                      {inventory.filter((i) => i.type === 'armor').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Armor</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-fantasy text-primary">
                      {inventory.filter((i) => i.type === 'potion').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Potions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-fantasy text-primary">
                      {inventory.filter((i) => i.type === 'key').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Keys</p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InventoryModal;
