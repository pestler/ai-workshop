// Word from Oxford 3000 dictionary
export interface Word {
  id: number;
  word: string;
  pos: string; // Part of speech: "n.", "v.", "adj.", etc.
  level: CEFRLevel;
}

// CEFR language proficiency levels
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

// Level filter including "ALL" option
export type LevelFilter = CEFRLevel | 'ALL';

// Word categorization status
export type WordStatus = 'known' | 'unknown' | 'skipped' | 'pending';

// Main application state
export interface AppState {
  // Word data
  allWords: Word[];
  shuffledQueue: number[]; // Word IDs in randomized order
  currentIndex: number;

  // Categorization
  knownWordIds: number[];
  unknownWordIds: number[];
  skippedWordIds: number[];

  // Filters and settings
  selectedLevel: LevelFilter;
  isStarted: boolean; // Whether user has selected level and started

  // Meta
  lastTestDate: string | null;
  sessionStartDate: string | null;
}

// Actions for reducer
export type AppAction =
  | { type: 'MARK_KNOWN'; wordId: number }
  | { type: 'MARK_UNKNOWN'; wordId: number }
  | { type: 'SKIP_WORD'; wordId: number }
  | { type: 'SET_LEVEL'; level: LevelFilter }
  | { type: 'START_TEST' }
  | { type: 'RESET_PROGRESS' }
  | { type: 'LOAD_STATE'; state: Partial<AppState> }
  | { type: 'INIT_WORDS'; words: Word[] };

// Statistics for display
export interface Statistics {
  total: number;
  reviewed: number;
  known: number;
  unknown: number;
  skipped: number;
  percentComplete: number;
  percentKnown: number;
}

// LocalStorage data structure
export interface StoredProgress {
  version: string;
  knownWordIds: number[];
  unknownWordIds: number[];
  skippedWordIds: number[];
  currentIndex: number;
  shuffledQueue: number[];
  selectedLevel: LevelFilter;
  lastTestDate: string | null;
  sessionStartDate: string | null;
}

// Words JSON file structure
export interface WordsData {
  metadata: {
    source: string;
    description: string;
    totalWords: number;
    levels: Record<CEFRLevel, { count: number; description: string }>;
  };
  words: Word[];
}
