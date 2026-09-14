/**
 * Schema migrations, applied in order, once each, forever. Safe to re-run:
 * `runMigrations` tracks what's applied in `schema_migrations` and only ever
 * runs the ones that aren't — which is what makes it safe to call on every
 * app launch rather than needing a separate "first run" path.
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { NPHCDA_SCHEDULE } from '@/domain/schedule';

export interface Migration {
  id: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

const DEFAULT_REMINDER_LEAD_DAYS = [7, 1, 0];

async function up001Initial(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS child (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      sex TEXT NOT NULL,
      photo_uri TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS dose_record (
      child_id TEXT NOT NULL,
      dose_id TEXT NOT NULL,
      status TEXT NOT NULL,
      given_date TEXT,
      note TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (child_id, dose_id),
      FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE
    );
  `);
  // `active_child_id` isn't part of the frozen `Prefs` contract type — it's
  // AppState.activeChildId. The brief specifies exactly four tables, so it
  // lives as an extra column on the singleton settings row rather than a
  // fifth table.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS prefs (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      active_child_id TEXT,
      reminders_enabled INTEGER NOT NULL,
      reminders_hour INTEGER NOT NULL,
      reminders_minute INTEGER NOT NULL,
      reminders_lead_days TEXT NOT NULL,
      onboarded INTEGER NOT NULL,
      schedule_version TEXT NOT NULL
    );
  `);

  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM prefs WHERE id = ?', [1]);
  if (!existing) {
    await db.runAsync(
      `INSERT INTO prefs
        (id, active_child_id, reminders_enabled, reminders_hour, reminders_minute, reminders_lead_days, onboarded, schedule_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, null, 1, 8, 0, JSON.stringify(DEFAULT_REMINDER_LEAD_DAYS), 0, NPHCDA_SCHEDULE.version],
    );
  }
}

export const MIGRATIONS: readonly Migration[] = [{ id: 1, name: 'initial schema', up: up001Initial }];

export async function runMigrations(db: SQLiteDatabase, migrations: readonly Migration[]): Promise<void> {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)',
  );

  const applied = await db.getAllAsync<{ id: number }>('SELECT id FROM schema_migrations');
  const appliedIds = new Set(applied.map((row) => row.id));
  const pending = [...migrations].sort((a, b) => a.id - b.id).filter((m) => !appliedIds.has(m.id));

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.runAsync('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)', [
        migration.id,
        migration.name,
        new Date().toISOString(),
      ]);
    });
  }
}
