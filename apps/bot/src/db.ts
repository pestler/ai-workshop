import fs from 'fs/promises';
import path from 'path';
import initSqlJs, { Database, SqlValue } from 'sql.js';
import { Word } from './types';

const DB_PATH = path.resolve(__dirname, '../data');
const DB_FILE_PATH = path.join(DB_PATH, 'bot.db');

let dbInstance: Database | null = null;

// Helper to convert sql.js output to a more usable object array
function resultsToObjectArray<T>(results: any[]): T[] {
  if (results.length === 0) {
    return [];
  }
  const [firstResult] = results;
  return firstResult.values.map((row: SqlValue[]) => {
    const obj: any = {};
    firstResult.columns.forEach((col: string, index: number) => {
      obj[col] = row[index];
    });
    return obj as T;
  });
}

export async function initializeDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure the data directory exists
  await fs.mkdir(DB_PATH, { recursive: true });

  const SQL = await initSqlJs();

  let db: Database;
  try {
    const fileBuffer = await fs.readFile(DB_FILE_PATH);
    db = new SQL.Database(fileBuffer);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('Файл базы данных не найден, создаем новый.');
      db = new SQL.Database();
    } else {
      throw error;
    }
  }

  // Create tables
  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      english_word TEXT NOT NULL UNIQUE,
      russian_translation TEXT
    );
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'paused'
      last_word_message_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS user_words (
      user_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'unknown',
      next_review_date TEXT,
      interval_minutes INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, word_id),
      FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `;
  db.exec(createTablesSql);
  await saveDatabase(db); // Save after schema creation

  console.log('База данных SQLite (sql.js) инициализирована.');
  dbInstance = db;
  return dbInstance;
}

export function getDb(): Database {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

export async function saveDatabase(db?: Database) {
  const dbToSave = db || getDb();
  const data = dbToSave.export();
  const buffer = Buffer.from(data);
  await fs.writeFile(DB_FILE_PATH, buffer);
}

// --- User Management ---

export type UserStatus = 'active' | 'paused';

export interface User {
  user_id: number;
  status: UserStatus;
  last_word_message_id?: number;
}

export async function getOrCreateUser(userId: number): Promise<User> {
  const db = getDb();
  let user: User | undefined;

  const selectSql = 'SELECT * FROM users WHERE user_id = ?';
  const results = db.exec(selectSql, [userId]);
  const users = resultsToObjectArray<User>(results);
  user = users[0];

  if (!user) {
    console.log(`Creating new user profile for ${userId}`);
    const insertSql = 'INSERT INTO users (user_id, status) VALUES (?, ?)';
    db.run(insertSql, [userId, 'active']);
    await saveDatabase();
    
    const newResults = db.exec(selectSql, [userId]);
    const newUsers = resultsToObjectArray<User>(newResults);
    user = newUsers[0];
  }
  
  return user;
}

export async function updateUserStatus(userId: number, status: UserStatus): Promise<void> {
  const db = getDb();
  const sql = 'UPDATE users SET status = ? WHERE user_id = ?';
  db.run(sql, [status, userId]);
  await saveDatabase();
}

export async function updateUserLastMessage(userId: number, messageId: number | null): Promise<void> {
  const db = getDb();
  const sql = 'UPDATE users SET last_word_message_id = ? WHERE user_id = ?';
  db.run(sql, [messageId, userId]);
  await saveDatabase();
}

// --- Word Management ---

export async function addWord(word: Word): Promise<Word | null> {
  const db = getDb();
  try {
    const sql = 'INSERT INTO words (english_word, russian_translation) VALUES (?, ?)';
    db.run(sql, [word.english_word, word.russian_translation ?? null]);
    await saveDatabase();

    // sql.js doesn't have lastID, so we have to query for the word
    const newWord = await getWordByEnglish(word.english_word);
    return newWord ?? null;

  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.warn(`Слово "${word.english_word}" уже существует в базе данных.`);
      const existingWord = await getWordByEnglish(word.english_word);
      return existingWord ?? null;
    }
    console.error('Ошибка при добавлении слова:', error);
    throw error;
  }
}

export async function getWordById(id: number): Promise<Word | undefined> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM words WHERE id = :id');
  const result = stmt.getAsObject({ ':id': id });
  stmt.free();

  if (result.id === undefined) {
    return undefined;
  }
  return result as unknown as Word | undefined;
}

export async function getWordByEnglish(englishWord: string): Promise<Word | undefined> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM words WHERE english_word = :english_word');
  const result = stmt.getAsObject({ ':english_word': englishWord });
  stmt.free();

  if (result.id === undefined) {
    return undefined;
  }
  return result as unknown as Word | undefined;
}

export async function updateWord(word: Word): Promise<boolean> {
  if (word.id === undefined) {
    throw new Error('Word ID is required for update operation.');
  }
  const db = getDb();
  const sql = 'UPDATE words SET english_word = ?, russian_translation = ? WHERE id = ?';
  db.run(sql, [word.english_word, word.russian_translation ?? null, word.id]);
  await saveDatabase();
  return db.getRowsModified() === 1;
}

export async function getAllWords(): Promise<Word[]> {
  const db = getDb();
  const results = db.exec('SELECT * FROM words');
  return resultsToObjectArray<Word>(results);
}

export async function associateWordWithUser(userId: number, wordId: number): Promise<void> {
  const db = getDb();
  try {
    // This will do nothing if the combination already exists due to PRIMARY KEY constraint
    const sql = 'INSERT OR IGNORE INTO user_words (user_id, word_id, status, next_review_date) VALUES (?, ?, ?, ?)';
    const now = new Date().toISOString();
    db.run(sql, [userId, wordId, 'unknown', now]);
    await saveDatabase();
  } catch (error) {
    console.error(`Error associating word ${wordId} with user ${userId}:`, error);
    throw error;
  }
}

export async function getWordForReview(userId: number): Promise<Word | null> {
  const db = getDb();
  const now = new Date().toISOString();
  
  // Prioritize words that are due for review, then new (unknown) words.
  // Fetches one word at a time.
  const sql = `
    SELECT w.* FROM words w
    JOIN user_words uw ON w.id = uw.word_id
    WHERE uw.user_id = ? AND uw.next_review_date <= ?
    ORDER BY uw.next_review_date
    LIMIT 1;
  `;
  
  const results = db.exec(sql, [userId, now]);
  const words = resultsToObjectArray<Word>(results);

  if (words.length > 0) {
    return words[0];
  }
  return null;
}

export async function getUsersWithDueWords(): Promise<number[]> {
  const db = getDb();
  const now = new Date().toISOString();
  const sql = `
    SELECT DISTINCT uw.user_id FROM user_words uw
    JOIN users u ON u.user_id = uw.user_id
    WHERE uw.next_review_date <= ? AND u.status = 'active'
  `;
  const results = db.exec(sql, [now]);
  if (results.length === 0) {
    return [];
  }
  // The result is an array of objects like [{ user_id: 123 }, { user_id: 456 }]
  // We need to flatten it to [123, 456]
  const users = resultsToObjectArray<{ user_id: number }>(results);
  return users.map(u => u.user_id);
}

export type WordStatus = 'unknown' | 'learning' | 'mastered';

export async function updateUserWordProgress(
  userId: number,
  wordId: number,
  newStatus: WordStatus,
  intervalMinutes: number
): Promise<void> {
  const db = getDb();
  
  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + intervalMinutes * 60000);
  
  const sql = `
    UPDATE user_words
    SET status = ?, next_review_date = ?, interval_minutes = ?
    WHERE user_id = ? AND word_id = ?;
  `;
  
  db.run(sql, [newStatus, nextReviewDate.toISOString(), intervalMinutes, userId, wordId]);
  await saveDatabase();
}

export async function getUserStats(userId: number): Promise<{
  learning: number;
  mastered: number;
  unknown: number;
  total: number;
}> {
  const db = getDb();
  const sql = `SELECT status, COUNT(word_id) as count FROM user_words WHERE user_id = ? GROUP BY status`;
  const results = db.exec(sql, [userId]);
  
  const stats = {
    learning: 0,
    mastered: 0,
    unknown: 0,
    total: 0,
  };

  if (results.length > 0) {
    results[0].values.forEach(row => {
      const status = row[0] as WordStatus;
      const count = row[1] as number;
      if (status in stats) {
        stats[status] = count;
      }
    });
  }

  stats.total = stats.learning + stats.mastered + stats.unknown;
  return stats;
}