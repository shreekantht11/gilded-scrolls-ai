import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Download, Copy, Scroll } from 'lucide-react';
import { toast } from 'sonner';

interface AdventureLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdventureLogModal = ({ isOpen, onClose }: AdventureLogModalProps) => {
  const storyLog = useGameStore((state) => state.storyLog);

  const handleExportTxt = () => {
    const content = storyLog
      .map((event) => {
        const date = new Date(event.timestamp).toLocaleString();
        return `[${date}] ${event.type.toUpperCase()}\n${event.text}\n\n`;
      })
      .join('---\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adventure-log-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Adventure log exported!');
  };

  const handleCopyAll = () => {
    const content = storyLog.map((event) => event.text).join('\n\n---\n\n');
    navigator.clipboard.writeText(content);
    toast.success('Story copied to clipboard!');
  };

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
            className="fixed inset-4 md:inset-12 z-50 flex items-center justify-center"
          >
            <Card className="w-full h-full panel-glow bg-card/98 backdrop-blur-md border-2 border-primary/40 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-primary/30">
                <div className="flex items-center gap-3">
                  <Scroll className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-fantasy gold-shimmer">
                    Adventure Log
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyAll}
                    className="hover:bg-primary/10"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleExportTxt}
                    className="hover:bg-primary/10"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="hover:bg-destructive/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                {storyLog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Scroll className="w-20 h-20 text-muted-foreground/30 mb-4" />
                    <p className="text-xl text-muted-foreground font-elegant">
                      Your adventure has just begun...
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-2">
                      Story events will appear here as you progress
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {storyLog.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-6 pb-6 border-l-2 border-primary/30 last:border-transparent"
                      >
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full bg-primary border-2 border-background" />

                        {/* Event Type Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 mb-2">
                          <span className="text-xs font-semibold text-primary uppercase">
                            {event.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Event Text */}
                        <p className="text-base font-elegant leading-relaxed text-foreground">
                          {event.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  {storyLog.length} events recorded
                </p>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdventureLogModal;
