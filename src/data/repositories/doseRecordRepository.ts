import type { SQLiteDatabase } from 'expo-sqlite';

import { asChildId, asDoseId, asISODate, asISOTimestamp, type ChildId, type DoseRecord, type DoseStatus } from '@/contracts';

interface DoseRecordRow {
  child_id: string;
  dose_id: string;
  status: string;
  given_date: string | null;
  note: string | null;
  updated_at: string;
}

function rowToRecord(row: DoseRecordRow): DoseRecord {
  return {
    childId: asChildId(row.child_id),
    doseId: asDoseId(row.dose_id),
    status: row.status as DoseStatus,
    givenDate: row.given_date ? asISODate(row.given_date) : null,
    note: row.note,
    updatedAt: asISOTimestamp(row.updated_at),
  };
}

export async function listRecordsByChild(db: SQLiteDatabase, childId: ChildId): Promise<DoseRecord[]> {
  const rows = await db.getAllAsync<DoseRecordRow>('SELECT * FROM dose_record WHERE child_id = ?', [childId]);
  return rows.map(rowToRecord);
}

/** One query per child — this app has at most a handful, so no need for an IN (...) query. */
export async function listAllRecords(
  db: SQLiteDatabase,
  childIds: readonly ChildId[],
): Promise<Record<string, DoseRecord[]>> {
  const result: Record<string, DoseRecord[]> = {};
  for (const id of childIds) {
    result[id] = await listRecordsByChild(db, id);
  }
  return result;
}

/** Read-then-write rather than an SQL upsert, so the fake test database doesn't need to parse ON CONFLICT. */
export async function upsertRecord(db: SQLiteDatabase, record: DoseRecord): Promise<void> {
  const existing = await db.getFirstAsync<{ child_id: string }>(
    'SELECT child_id FROM dose_record WHERE child_id = ? AND dose_id = ?',
    [record.childId, record.doseId],
  );

  if (existing) {
    await db.runAsync(
      'UPDATE dose_record SET status = ?, given_date = ?, note = ?, updated_at = ? WHERE child_id = ? AND dose_id = ?',
      [record.status, record.givenDate, record.note, record.updatedAt, record.childId, record.doseId],
    );
  } else {
    await db.runAsync(
      'INSERT INTO dose_record (child_id, dose_id, status, given_date, note, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [record.childId, record.doseId, record.status, record.givenDate, record.note, record.updatedAt],
    );
  }
}

export async function deleteRecord(db: SQLiteDatabase, childId: ChildId, doseId: string): Promise<void> {
  await db.runAsync('DELETE FROM dose_record WHERE child_id = ? AND dose_id = ?', [childId, doseId]);
}
