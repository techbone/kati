/**
 * The one SQLite connection for the app's life. expo-sqlite connections
 * aren't free to open, so this is opened once and reused everywhere.
 */
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'kati.db';

let dbPromise: Promise<SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      // FKs so deleting a child cleans up its dose_record rows; WAL so a
      // background read never blocks a foreground write; a busy timeout so a
      // brief overlap waits instead of throwing.
      await db.execAsync('PRAGMA foreign_keys = ON');
      await db.execAsync('PRAGMA journal_mode = WAL');
      await db.execAsync('PRAGMA busy_timeout = 3000');
      return db;
    });
  }
  return dbPromise;
}

/** Test-only: drops the cached connection so the next getDatabase() reopens. */
export function resetDatabaseCacheForTests(): void {
  dbPromise = null;
}
