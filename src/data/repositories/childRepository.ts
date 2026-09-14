import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';

import { asChildId, asISODate, asISOTimestamp, type Child, type ChildId, type Sex } from '@/contracts';

interface ChildRow {
  id: string;
  name: string;
  birth_date: string;
  sex: string;
  photo_uri: string | null;
  created_at: string;
  updated_at: string;
}

function rowToChild(row: ChildRow): Child {
  return {
    id: asChildId(row.id),
    name: row.name,
    birthDate: asISODate(row.birth_date),
    sex: row.sex as Sex,
    photoUri: row.photo_uri,
    createdAt: asISOTimestamp(row.created_at),
    updatedAt: asISOTimestamp(row.updated_at),
  };
}

/** Oldest first — the order a parent added them in, which is also onboarding order. */
export async function listChildren(db: SQLiteDatabase): Promise<Child[]> {
  const rows = await db.getAllAsync<ChildRow>('SELECT * FROM child ORDER BY created_at ASC');
  return rows.map(rowToChild);
}

export async function insertChild(db: SQLiteDatabase, child: Child): Promise<void> {
  await db.runAsync(
    'INSERT INTO child (id, name, birth_date, sex, photo_uri, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [child.id, child.name, child.birthDate, child.sex, child.photoUri, child.createdAt, child.updatedAt],
  );
}

export interface ChildPatch {
  name?: string;
  birthDate?: string;
  sex?: Sex;
  photoUri?: string | null;
}

export async function updateChild(
  db: SQLiteDatabase,
  id: ChildId,
  patch: ChildPatch,
  updatedAt: string,
): Promise<void> {
  const sets: string[] = [];
  const params: SQLiteBindValue[] = [];
  if (patch.name !== undefined) {
    sets.push('name = ?');
    params.push(patch.name);
  }
  if (patch.birthDate !== undefined) {
    sets.push('birth_date = ?');
    params.push(patch.birthDate);
  }
  if (patch.sex !== undefined) {
    sets.push('sex = ?');
    params.push(patch.sex);
  }
  if (patch.photoUri !== undefined) {
    sets.push('photo_uri = ?');
    params.push(patch.photoUri);
  }
  // Always bumps updated_at, even for an empty patch — matches the mock
  // store's `{ ...c, ...patch, updatedAt: now() }`, which does the same.
  sets.push('updated_at = ?');
  params.push(updatedAt);
  params.push(id);

  await db.runAsync(`UPDATE child SET ${sets.join(', ')} WHERE id = ?`, params);
}

/** Also removes the child's dose records — a leaf delete, not left to FK cascade alone. */
export async function deleteChild(db: SQLiteDatabase, id: ChildId): Promise<void> {
  await db.runAsync('DELETE FROM dose_record WHERE child_id = ?', [id]);
  await db.runAsync('DELETE FROM child WHERE id = ?', [id]);
}
