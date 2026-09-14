import type { SQLiteDatabase } from 'expo-sqlite';

import { asChildId, type ChildId, type Prefs } from '@/contracts';

interface PrefsRow {
  id: number;
  active_child_id: string | null;
  reminders_enabled: number;
  reminders_hour: number;
  reminders_minute: number;
  reminders_lead_days: string;
  onboarded: number;
  schedule_version: string;
}

const ROW_ID = 1;

function rowToPrefs(row: PrefsRow): Prefs {
  return {
    reminders: {
      enabled: row.reminders_enabled === 1,
      hour: row.reminders_hour,
      minute: row.reminders_minute,
      leadDays: JSON.parse(row.reminders_lead_days) as number[],
    },
    onboarded: row.onboarded === 1,
    scheduleVersion: row.schedule_version,
  };
}

async function getRow(db: SQLiteDatabase): Promise<PrefsRow> {
  const row = await db.getFirstAsync<PrefsRow>('SELECT * FROM prefs WHERE id = ?', [ROW_ID]);
  if (!row) throw new Error('prefs row missing — migration 1 should have seeded it');
  return row;
}

export async function getPrefs(db: SQLiteDatabase): Promise<Prefs> {
  return rowToPrefs(await getRow(db));
}

export async function getActiveChildId(db: SQLiteDatabase): Promise<ChildId | null> {
  const row = await getRow(db);
  return row.active_child_id ? asChildId(row.active_child_id) : null;
}

/** Pure write — the caller (the store) owns merging a patch into the current prefs. */
export async function savePrefs(db: SQLiteDatabase, prefs: Prefs): Promise<void> {
  await db.runAsync(
    `UPDATE prefs SET
       reminders_enabled = ?, reminders_hour = ?, reminders_minute = ?, reminders_lead_days = ?,
       onboarded = ?, schedule_version = ?
     WHERE id = ?`,
    [
      prefs.reminders.enabled ? 1 : 0,
      prefs.reminders.hour,
      prefs.reminders.minute,
      JSON.stringify(prefs.reminders.leadDays),
      prefs.onboarded ? 1 : 0,
      prefs.scheduleVersion,
      ROW_ID,
    ],
  );
}

export async function setActiveChildId(db: SQLiteDatabase, id: ChildId | null): Promise<void> {
  await db.runAsync('UPDATE prefs SET active_child_id = ? WHERE id = ?', [id, ROW_ID]);
}
