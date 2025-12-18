import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction, Word } from '../types';
import { getShuffledWordIds } from '../utils/shuffle';
import { storageService } from '../services/storageService';

// Initial state
const initialState: AppState = {
  allWords: [],
  shuffledQueue: [],
  currentIndex: 0,
  knownWordIds: [],
  unknownWordIds: [],
  skippedWordIds: [],
  selectedLevel: 'ALL',
  isStarted: false,
  lastTestDate: null,
  sessionStartDate: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INIT_WORDS':
      return {
        ...state,
        allWords: action.words,
      };

    case 'SET_LEVEL':
      return {
        ...state,
        selectedLevel: action.level,
      };

    case 'START_TEST': {
      const shuffledQueue = getShuffledWordIds(state.allWords, state.selectedLevel);
      return {
        ...state,
        isStarted: true,
        shuffledQueue,
        currentIndex: 0,
        knownWordIds: [],
        unknownWordIds: [],
        skippedWordIds: [],
        sessionStartDate: new Date().toISOString(),
      };
    }

    case 'MARK_KNOWN':
      return {
        ...state,
        knownWordIds: [...state.knownWordIds, action.wordId],
        currentIndex: state.currentIndex + 1,
        lastTestDate: new Date().toISOString(),
      };

    case 'MARK_UNKNOWN':
      return {
        ...state,
        unknownWordIds: [...state.unknownWordIds, action.wordId],
        currentIndex: state.currentIndex + 1,
        lastTestDate: new Date().toISOString(),
      };

    case 'SKIP_WORD':
      return {
        ...state,
        skippedWordIds: [...state.skippedWordIds, action.wordId],
        currentIndex: state.currentIndex + 1,
        lastTestDate: new Date().toISOString(),
      };

    case 'RESET_PROGRESS': {
      storageService.clearProgress();
      return {
        ...state,
        isStarted: false,
        shuffledQueue: [],
        currentIndex: 0,
        knownWordIds: [],
        unknownWordIds: [],
        skippedWordIds: [],
        lastTestDate: null,
        sessionStartDate: null,
      };
    }

    case 'LOAD_STATE':
      return {
        ...state,
        ...action.state,
        isStarted: true,
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  currentWord: Word | null;
  isComplete: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

// Provider
interface AppProviderProps {
  children: ReactNode;
  words: Word[];
}

export function AppProvider({ children, words }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize words
  useEffect(() => {
    dispatch({ type: 'INIT_WORDS', words });

    // Try to load saved progress
    const savedProgress = storageService.loadProgress();
    if (savedProgress && savedProgress.shuffledQueue.length > 0) {
      dispatch({ type: 'LOAD_STATE', state: savedProgress });
    }
  }, [words]);

  // Auto-save on state changes
  useEffect(() => {
    if (state.isStarted) {
      storageService.saveProgress(state);
    }
  }, [state]);

  // Get current word
  const currentWordId = state.shuffledQueue[state.currentIndex];
  const currentWord = state.allWords.find((w) => w.id === currentWordId) || null;

  // Check if test is complete
  const isComplete =
    state.isStarted && state.currentIndex >= state.shuffledQueue.length;

  return (
    <AppContext.Provider value={{ state, dispatch, currentWord, isComplete }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
