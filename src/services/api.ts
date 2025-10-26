import { Player, Enemy, StoryEvent, Item } from '@/store/gameStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface StoryRequest {
  player: Player;
  genre: string;
  previousEvents: StoryEvent[];
  choice?: string;
}

interface StoryResponse {
  story: string;
  choices: string[];
  events?: Partial<StoryEvent>[];
  enemy?: Enemy;
  items?: Item[];
}

interface CombatRequest {
  player: Player;
  enemy: Enemy;
  action: 'attack' | 'defend' | 'use-item' | 'run';
  itemId?: string;
}

interface CombatResponse {
  playerDamage: number;
  enemyDamage: number;
  playerHealth: number;
  enemyHealth: number;
  combatLog: string[];
  victory?: boolean;
  defeat?: boolean;
  rewards?: {
    xp: number;
    items: Item[];
    gold: number;
  };
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new APIError(response.status, `HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
};

export const api = {
  // Story Generation
  async generateStory(request: StoryRequest): Promise<StoryResponse> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Story generation failed:', error);
      // Return mock data for offline mode
      return {
        story: 'You venture deeper into the unknown. The path ahead splits in multiple directions...',
        choices: [
          'Take the left path through the dark forest',
          'Follow the right path toward the mountains',
          'Rest and examine your surroundings',
        ],
      };
    }
  },

  // Combat System
  async processCombat(request: CombatRequest): Promise<CombatResponse> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/combat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error('Combat processing failed:', error);
      // Return mock combat result
      const playerDamage = Math.floor(Math.random() * 20) + 10;
      const enemyDamage = Math.floor(Math.random() * 15) + 5;
      return {
        playerDamage: enemyDamage,
        enemyDamage: playerDamage,
        playerHealth: request.player.health - enemyDamage,
        enemyHealth: request.enemy.health - playerDamage,
        combatLog: [
          `You dealt ${playerDamage} damage!`,
          `Enemy dealt ${enemyDamage} damage!`,
        ],
      };
    }
  },

  // Save Game
  async saveGame(saveData: any): Promise<{ success: boolean; saveId: string }> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });
      return await response.json();
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  },

  // Load Game
  async loadGame(saveId: string): Promise<any> {
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/api/save/${saveId}`,
        { method: 'GET' }
      );
      return await response.json();
    } catch (error) {
      console.error('Load failed:', error);
      throw error;
    }
  },

  // Get Player Saves
  async getSaves(playerId: string): Promise<any[]> {
    try {
      const response = await fetchWithRetry(
        `${API_BASE_URL}/api/saves/${playerId}`,
        { method: 'GET' }
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch saves:', error);
      return [];
    }
  },
};
