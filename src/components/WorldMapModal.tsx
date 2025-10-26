import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import WorldMap from './WorldMap';

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorldMapModal = ({ isOpen, onClose }: WorldMapModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border-2 border-primary rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold text-primary mb-6">🗺️ World Map</h2>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <WorldMap />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorldMapModal;
