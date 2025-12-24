// apps/bot/src/types.ts

export interface Word {
  id?: number; // Optional, as it's auto-incremented by the DB
  english_word: string;
  russian_translation?: string; // Optional, might be fetched later
}

export interface UserWord {
  user_id: number;
  word_id: number;
  status: 'known' | 'unknown' | 'learning';
  next_review_date?: string; // ISO date string, optional initially
  interval_days: number;
}
