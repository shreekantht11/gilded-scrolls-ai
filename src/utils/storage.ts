interface SaveSlot {
  id: string;
  name: string;
  timestamp: Date;
  data: any;
}

const STORAGE_KEY = 'ai-dungeon-master';
const MAX_SLOTS = 3;
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const storage = {
  // Get all save slots
  getSaveSlots(): SaveSlot[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}-saves`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load save slots:', error);
      return [];
    }
  },

  // Save to specific slot
  saveToSlot(slotId: string, name: string, data: any): boolean {
    try {
      const slots = this.getSaveSlots();
      const existingIndex = slots.findIndex((s) => s.id === slotId);

      const saveSlot: SaveSlot = {
        id: slotId,
        name,
        timestamp: new Date(),
        data,
      };

      if (existingIndex >= 0) {
        slots[existingIndex] = saveSlot;
      } else {
        if (slots.length >= MAX_SLOTS) {
          // Remove oldest save
          slots.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          slots.shift();
        }
        slots.push(saveSlot);
      }

      localStorage.setItem(`${STORAGE_KEY}-saves`, JSON.stringify(slots));
      return true;
    } catch (error) {
      console.error('Failed to save:', error);
      return false;
    }
  },

  // Load from specific slot
  loadFromSlot(slotId: string): any | null {
    try {
      const slots = this.getSaveSlots();
      const slot = slots.find((s) => s.id === slotId);
      return slot ? slot.data : null;
    } catch (error) {
      console.error('Failed to load save:', error);
      return null;
    }
  },

  // Delete save slot
  deleteSlot(slotId: string): boolean {
    try {
      const slots = this.getSaveSlots();
      const filtered = slots.filter((s) => s.id !== slotId);
      localStorage.setItem(`${STORAGE_KEY}-saves`, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  },

  // Auto-save
  autoSave(data: any): void {
    this.saveToSlot('auto-save', 'Auto Save', data);
  },

  // Export save as JSON
  exportSave(slotId: string): string | null {
    const slot = this.getSaveSlots().find((s) => s.id === slotId);
    return slot ? JSON.stringify(slot, null, 2) : null;
  },

  // Import save from JSON
  importSave(jsonData: string): boolean {
    try {
      const saveSlot: SaveSlot = JSON.parse(jsonData);
      const slots = this.getSaveSlots();
      slots.push(saveSlot);
      localStorage.setItem(`${STORAGE_KEY}-saves`, JSON.stringify(slots));
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  },

  // Clear all saves
  clearAllSaves(): void {
    localStorage.removeItem(`${STORAGE_KEY}-saves`);
  },

  // Get last auto-save
  getLastAutoSave(): any | null {
    return this.loadFromSlot('auto-save');
  },
};

// Setup auto-save interval
export const setupAutoSave = (getGameState: () => any) => {
  const interval = setInterval(() => {
    const state = getGameState();
    if (state.gameStarted) {
      storage.autoSave(state);
    }
  }, AUTO_SAVE_INTERVAL);

  return () => clearInterval(interval);
};
