import { createFakeSqliteDatabase } from '@/data/testSupport/fakeSqliteDatabase';
import { MIGRATIONS, runMigrations } from '@/data/migrations';

describe('runMigrations', () => {
  it('creates every table the app needs', async () => {
    const db = createFakeSqliteDatabase();
    await runMigrations(db, MIGRATIONS);

    await expect(db.getAllAsync('SELECT * FROM child')).resolves.toEqual([]);
    await expect(db.getAllAsync('SELECT * FROM dose_record')).resolves.toEqual([]);
    const prefsRows = await db.getAllAsync<{ id: number }>('SELECT * FROM prefs');
    expect(prefsRows).toHaveLength(1);
    const migrationRows = await db.getAllAsync<{ id: number }>('SELECT * FROM schema_migrations');
    expect(migrationRows.map((r) => r.id)).toEqual(MIGRATIONS.map((m) => m.id));
  });

  it('seeds exactly one prefs row with sane defaults', async () => {
    const db = createFakeSqliteDatabase();
    await runMigrations(db, MIGRATIONS);
    const row = await db.getFirstAsync<{
      reminders_enabled: number;
      reminders_hour: number;
      reminders_lead_days: string;
      onboarded: number;
      active_child_id: string | null;
    }>('SELECT * FROM prefs WHERE id = ?', [1]);
    expect(row).toMatchObject({
      reminders_enabled: 1,
      reminders_hour: 8,
      onboarded: 0,
      active_child_id: null,
    });
    expect(JSON.parse(row!.reminders_lead_days)).toEqual([7, 1, 0]);
  });

  it('is a no-op the second time it runs: each migration executes exactly once', async () => {
    const db = createFakeSqliteDatabase();
    const spy = jest.fn(MIGRATIONS[0]!.up);
    const migrations = [{ ...MIGRATIONS[0]!, up: spy }];

    await runMigrations(db, migrations);
    await runMigrations(db, migrations);
    await runMigrations(db, migrations);

    expect(spy).toHaveBeenCalledTimes(1);
    const migrationRows = await db.getAllAsync('SELECT * FROM schema_migrations');
    expect(migrationRows).toHaveLength(1);
    // And the seeded data wasn't duplicated by a second run either.
    const prefsRows = await db.getAllAsync('SELECT * FROM prefs');
    expect(prefsRows).toHaveLength(1);
  });

  it('applies only the migrations not yet recorded, in id order', async () => {
    const db = createFakeSqliteDatabase();
    const order: number[] = [];
    const migrations = [
      { id: 1, name: 'one', up: async () => { order.push(1); } },
      { id: 3, name: 'three', up: async () => { order.push(3); } },
      { id: 2, name: 'two', up: async () => { order.push(2); } },
    ];

    await runMigrations(db, migrations.slice(0, 2)); // id 1 and 3 only, out of order on purpose
    await runMigrations(db, migrations); // now all three are offered

    expect(order).toEqual([1, 3, 2]);
    const migrationRows = await db.getAllAsync<{ id: number }>('SELECT * FROM schema_migrations ORDER BY id');
    expect(migrationRows.map((r) => r.id)).toEqual([1, 2, 3]);
  });
});
