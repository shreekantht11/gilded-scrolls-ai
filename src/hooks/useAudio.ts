import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
}

export const useAudio = () => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Play sound effect
  const playSound = useCallback(
    (soundName: string, options: AudioOptions = {}) => {
      if (!soundEnabled) return;

      try {
        const audio = new Audio(`/sounds/${soundName}.mp3`);
        audio.volume = options.volume ?? 0.5;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Failed to play sound:', error);
      }
    },
    [soundEnabled]
  );

  // Play background music
  const playMusic = useCallback(
    (musicName: string, options: AudioOptions = {}) => {
      if (!musicEnabled) return;

      try {
        // Stop existing music
        if (musicRef.current) {
          musicRef.current.pause();
          musicRef.current = null;
        }

        const audio = new Audio(`/music/${musicName}.mp3`);
        audio.volume = options.volume ?? 0.3;
        audio.loop = options.loop ?? true;
        audio.play().catch(console.error);
        musicRef.current = audio;
      } catch (error) {
        console.error('Failed to play music:', error);
      }
    },
    [musicEnabled]
  );

  // Stop music
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
      }
    };
  }, []);

  return {
    playSound,
    playMusic,
    stopMusic,
  };
};

// Predefined sound effects
export const SOUNDS = {
  CLICK: 'click',
  ATTACK: 'sword-slash',
  DEFEND: 'shield-block',
  HEAL: 'potion-drink',
  LEVEL_UP: 'level-up',
  ACHIEVEMENT: 'achievement',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  ITEM_PICKUP: 'item-pickup',
  MENU_OPEN: 'menu-open',
  MENU_CLOSE: 'menu-close',
};

// Predefined music tracks
export const MUSIC = {
  MENU: 'menu-theme',
  FANTASY: 'fantasy-adventure',
  SCIFI: 'sci-fi-exploration',
  MYSTERY: 'mystery-theme',
  MYTHICAL: 'mythical-realm',
  COMBAT: 'combat-intense',
};
