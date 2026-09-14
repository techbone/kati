import { asChildId, asDoseId, asISODate, asISOTimestamp, type Child, type DoseRecord } from '@/contracts';
import * as childRepo from '@/data/repositories/childRepository';
import * as doseRecordRepo from '@/data/repositories/doseRecordRepository';
import { MIGRATIONS, runMigrations } from '@/data/migrations';
import * as prefsRepo from '@/data/repositories/prefsRepository';

import { createFakeSqliteDatabase } from '@/data/testSupport/fakeSqliteDatabase';

async function freshDb() {
  const db = createFakeSqliteDatabase();
  await runMigrations(db, MIGRATIONS);
  return db;
}

function makeChild(overrides: Partial<Child> = {}): Child {
  return {
    id: asChildId('child-1'),
    name: 'Amina',
    birthDate: asISODate('2026-01-01'),
    sex: 'female',
    photoUri: null,
    createdAt: asISOTimestamp('2026-01-01T00:00:00.000Z'),
    updatedAt: asISOTimestamp('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('childRepository', () => {
  it('round-trips a child exactly', async () => {
    const db = await freshDb();
    const child = makeChild();
    await childRepo.insertChild(db, child);
    expect(await childRepo.listChildren(db)).toEqual([child]);
  });

  it('lists children oldest-created first', async () => {
    const db = await freshDb();
    const first = makeChild({ id: asChildId('c1'), createdAt: asISOTimestamp('2026-01-01T00:00:00.000Z') });
    const second = makeChild({ id: asChildId('c2'), createdAt: asISOTimestamp('2026-02-01T00:00:00.000Z') });
    await childRepo.insertChild(db, second);
    await childRepo.insertChild(db, first);
    expect((await childRepo.listChildren(db)).map((c) => c.id)).toEqual([first.id, second.id]);
  });

  it('updates only the given fields and always bumps updated_at', async () => {
    const db = await freshDb();
    const child = makeChild();
    await childRepo.insertChild(db, child);
    await childRepo.updateChild(db, child.id, { name: 'Amina B.' }, asISOTimestamp('2026-03-01T00:00:00.000Z'));
    const [updated] = await childRepo.listChildren(db);
    expect(updated).toMatchObject({ name: 'Amina B.', birthDate: child.birthDate, sex: child.sex });
    expect(updated!.updatedAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('deleting a child also deletes their dose records', async () => {
    const db = await freshDb();
    const child = makeChild();
    await childRepo.insertChild(db, child);
    await doseRecordRepo.upsertRecord(db, {
      childId: child.id,
      doseId: asDoseId('bcg'),
      status: 'given',
      givenDate: asISODate('2026-01-01'),
      note: null,
      updatedAt: asISOTimestamp('2026-01-01T00:00:00.000Z'),
    });

    await childRepo.deleteChild(db, child.id);

    expect(await childRepo.listChildren(db)).toEqual([]);
    expect(await doseRecordRepo.listRecordsByChild(db, child.id)).toEqual([]);
  });
});

describe('doseRecordRepository', () => {
  const childId = asChildId('child-1');
  const doseId = asDoseId('bcg');
  const baseRecord: DoseRecord = {
    childId,
    doseId,
    status: 'given',
    givenDate: asISODate('2026-01-01'),
    note: 'left arm',
    updatedAt: asISOTimestamp('2026-01-01T00:00:00.000Z'),
  };

  it('inserts a record that does not exist yet', async () => {
    const db = await freshDb();
    await doseRecordRepo.upsertRecord(db, baseRecord);
    expect(await doseRecordRepo.listRecordsByChild(db, childId)).toEqual([baseRecord]);
  });

  it('updates in place rather than duplicating on a second upsert', async () => {
    const db = await freshDb();
    await doseRecordRepo.upsertRecord(db, baseRecord);
    const skipped: DoseRecord = {
      ...baseRecord,
      status: 'skipped',
      givenDate: null,
      note: null,
      updatedAt: asISOTimestamp('2026-02-01T00:00:00.000Z'),
    };
    await doseRecordRepo.upsertRecord(db, skipped);

    const records = await doseRecordRepo.listRecordsByChild(db, childId);
    expect(records).toEqual([skipped]);
  });

  it('deletes a single record without touching others', async () => {
    const db = await freshDb();
    const other: DoseRecord = { ...baseRecord, doseId: asDoseId('opv-0') };
    await doseRecordRepo.upsertRecord(db, baseRecord);
    await doseRecordRepo.upsertRecord(db, other);

    await doseRecordRepo.deleteRecord(db, childId, doseId);

    const remaining = await doseRecordRepo.listRecordsByChild(db, childId);
    expect(remaining).toEqual([other]);
  });

  it('listAllRecords groups records per child, including children with none', async () => {
    const db = await freshDb();
    await doseRecordRepo.upsertRecord(db, baseRecord);
    const result = await doseRecordRepo.listAllRecords(db, [childId, asChildId('child-2')]);
    expect(result[childId]).toEqual([baseRecord]);
    expect(result['child-2']).toEqual([]);
  });
});

describe('prefsRepository', () => {
  it('reads back the defaults the migration seeded', async () => {
    const db = await freshDb();
    expect(await prefsRepo.getPrefs(db)).toEqual({
      reminders: { enabled: true, hour: 8, minute: 0, leadDays: [7, 1, 0] },
      onboarded: false,
      scheduleVersion: expect.any(String),
    });
    expect(await prefsRepo.getActiveChildId(db)).toBeNull();
  });

  it('savePrefs persists a full replacement, round-tripping every field', async () => {
    const db = await freshDb();
    const next = {
      reminders: { enabled: false, hour: 20, minute: 45, leadDays: [3, 0] },
      onboarded: true,
      scheduleVersion: 'NPHCDA-2024.1',
    };
    await prefsRepo.savePrefs(db, next);
    expect(await prefsRepo.getPrefs(db)).toEqual(next);
  });

  it('setActiveChildId persists and can be cleared back to null', async () => {
    const db = await freshDb();
    await prefsRepo.setActiveChildId(db, asChildId('child-1'));
    expect(await prefsRepo.getActiveChildId(db)).toBe('child-1');
    await prefsRepo.setActiveChildId(db, null);
    expect(await prefsRepo.getActiveChildId(db)).toBeNull();
  });
});
