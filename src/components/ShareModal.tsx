import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Copy, Download, Twitter, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from 'react-i18next';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal = ({ isOpen, onClose }: ShareModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const player = useGameStore(state => state.player);
  const storyLog = useGameStore(state => state.storyLog);

  if (!isOpen || !player) return null;

  const generateShareText = () => {
    const recentStory = storyLog.slice(-3).map(e => e.text).join('\n\n');
    return `🎮 Playing AI Dungeon Master as ${player.name}, Level ${player.level} ${player.class}!\n\n${recentStory}\n\n#AIDungeonMaster #TextAdventure`;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateShareText());
    toast({ title: 'Copied!', description: 'Adventure text copied to clipboard' });
  };

  const handleDownloadLog = () => {
    const fullLog = storyLog.map(e => `[${new Date(e.timestamp).toLocaleString()}] ${e.text}`).join('\n\n');
    const blob = new Blob([fullLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adventure-log-${player.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'Adventure log saved' });
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

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
        className="bg-card border-2 border-primary rounded-xl p-6 max-w-lg w-full"
      >
        <div className="flex items-center gap-3 mb-6">
          <Share2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Share Your Adventure</h2>
        </div>

        {/* Preview Text */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Share Preview
          </label>
          <Textarea
            value={generateShareText()}
            readOnly
            className="min-h-[150px] resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleCopyToClipboard} variant="outline" className="gap-2">
              <Copy className="w-4 h-4" />
              Copy Text
            </Button>
            <Button onClick={handleDownloadLog} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download Log
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleShareTwitter} className="gap-2 bg-blue-500 hover:bg-blue-600">
              <Twitter className="w-4 h-4" />
              Share on Twitter
            </Button>
            <Button onClick={handleShareFacebook} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Facebook className="w-4 h-4" />
              Share on Facebook
            </Button>
          </div>

          <Button onClick={onClose} variant="ghost" className="w-full">
            Close
          </Button>
        </div>

        {/* Character Card Preview */}
        <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg border border-primary/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-3xl">
              {player.class === 'Warrior' ? '⚔️' : player.class === 'Mage' ? '🧙' : '🗡️'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{player.name}</h3>
              <p className="text-sm text-muted-foreground">
                Level {player.level} {player.class} • {player.health}/{player.maxHealth} HP
              </p>
              <p className="text-xs text-primary font-medium mt-1">
                🏆 XP: {player.xp}/{player.maxXp}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareModal;
