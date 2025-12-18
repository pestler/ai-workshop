import type { AppState, StoredProgress } from '../types';

const STORAGE_KEY = 'oxford3000_progress';
const CURRENT_VERSION = '1.0.0';

export const storageService = {
  /**
   * Save current progress to LocalStorage
   */
  saveProgress(state: AppState): void {
    const data: StoredProgress = {
      version: CURRENT_VERSION,
      knownWordIds: state.knownWordIds,
      unknownWordIds: state.unknownWordIds,
      skippedWordIds: state.skippedWordIds,
      currentIndex: state.currentIndex,
      shuffledQueue: state.shuffledQueue,
      selectedLevel: state.selectedLevel,
      lastTestDate: state.lastTestDate,
      sessionStartDate: state.sessionStartDate,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  },

  /**
   * Load progress from LocalStorage
   */
  loadProgress(): StoredProgress | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data) as StoredProgress;

      // Version check for future migrations
      if (parsed.version !== CURRENT_VERSION) {
        console.warn('Storage version mismatch, may need migration');
      }

      return parsed;
    } catch (e) {
      console.error('Failed to load progress:', e);
      return null;
    }
  },

  /**
   * Clear all saved progress
   */
  clearProgress(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear progress:', e);
    }
  },

  /**
   * Check if there is saved progress
   */
  hasProgress(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  },
};
