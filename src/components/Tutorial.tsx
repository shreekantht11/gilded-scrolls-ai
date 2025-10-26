import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  highlight?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to AI Dungeon Master! 🎮',
    description: 'An AI-powered text adventure where your choices shape the story. Let me show you around!',
    position: 'center',
  },
  {
    title: 'Your Character Stats',
    description: 'Keep an eye on your Health and XP bars at the top. Level up by gaining experience!',
    position: 'top',
  },
  {
    title: 'The Story Panel',
    description: 'Your adventure unfolds here. Read the narrative and make choices to progress.',
    position: 'left',
  },
  {
    title: 'Action Buttons',
    description: 'Use these to interact: Attack enemies, Defend yourself, Use items, or explore.',
    position: 'right',
  },
  {
    title: 'Quick Actions',
    description: 'Access your Inventory, Adventure Log, Save game, and Settings from the top right.',
    position: 'top',
  },
  {
    title: 'Ready to Adventure!',
    description: 'Your journey begins now. Make wise choices and may fortune favor you!',
    position: 'center',
  },
];

interface TutorialProps {
  onComplete: () => void;
}

const Tutorial = ({ onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentTutorial = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('tutorial_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-24 left-1/2 -translate-x-1/2',
    bottom: 'bottom-24 left-1/2 -translate-x-1/2',
    left: 'top-1/2 left-24 -translate-y-1/2',
    right: 'top-1/2 right-24 -translate-y-1/2',
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        />

        {/* Tutorial Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute ${positionClasses[currentTutorial.position]} max-w-md w-full`}
        >
          <div className="bg-card border-2 border-primary rounded-xl p-6 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-primary mb-3">{currentTutorial.title}</h3>
              <p className="text-muted-foreground">{currentTutorial.description}</p>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Step {currentStep + 1} of {tutorialSteps.length}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <Button onClick={handleSkip} variant="ghost">
                Skip Tutorial
              </Button>

              <Button onClick={handleNext} className="gap-2">
                {currentStep === tutorialSteps.length - 1 ? 'Start Adventure' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Tutorial;
