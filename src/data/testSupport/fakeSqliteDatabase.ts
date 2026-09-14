/**
 * A hand-rolled stand-in for `expo-sqlite`'s `SQLiteDatabase`, scoped to
 * exactly the SQL this app's migrations and repositories emit — not a
 * general SQL engine. expo-sqlite is a native module with no Node runtime,
 * so there is no real SQLite to test against under Jest; this fake exists so
 * the migration runner and repositories can be tested for real behaviour
 * (idempotency, round-tripping) rather than only type-checked.
 *
 * Supported, and only this:
 *   CREATE TABLE IF NOT EXISTS <table> (...)   — column defs ignored, ok to re-run
 *   INSERT INTO <table> (a, b, ...) VALUES (?, ?, ...)
 *   UPDATE <table> SET a = ?, b = ? [, ...] WHERE a = ? [AND b = ?]
 *   DELETE FROM <table> WHERE a = ? [AND b = ?]
 *   SELECT * | col[, col...] FROM <table> [WHERE a = ? [AND b = ?]] [ORDER BY col [ASC|DESC]]
 *   PRAGMA ...                                  — no-op
 *
 * Every value in application SQL must be a `?` placeholder bound via the
 * params array — no inline literals — which is what keeps this parser small.
 */
import type { SQLiteBindParams, SQLiteDatabase } from 'expo-sqlite';

type Row = Record<string, unknown>;

function splitTopLevel(source: string, separator: string): string[] {
  return source.split(separator).map((s) => s.trim());
}

function parseWhere(clause: string | undefined, params: unknown[]): (row: Row) => boolean {
  if (!clause) return () => true;
  const conditions = clause.split(/\s+AND\s+/i).map((cond) => {
    const match = /^(\w+)\s*=\s*\?$/.exec(cond.trim());
    if (!match) throw new Error(`fakeSqliteDatabase: unsupported WHERE condition "${cond}"`);
    return match[1]!;
  });
  const values = params.splice(0, conditions.length);
  return (row) => conditions.every((col, i) => row[col] === values[i]);
}

function normalizeParams(params: SQLiteBindParams | undefined): unknown[] {
  if (params == null) return [];
  return Array.isArray(params) ? [...params] : Object.values(params);
}

export function createFakeSqliteDatabase(): SQLiteDatabase {
  const tables = new Map<string, Row[]>();

  function table(name: string): Row[] {
    const rows = tables.get(name);
    if (!rows) throw new Error(`fakeSqliteDatabase: no such table "${name}"`);
    return rows;
  }

  const db = {
    async execAsync(source: string): Promise<void> {
      for (const statement of source.split(';').map((s) => s.trim()).filter(Boolean)) {
        const createMatch = /^CREATE TABLE IF NOT EXISTS\s+(\w+)/i.exec(statement);
        if (createMatch) {
          const name = createMatch[1]!;
          if (!tables.has(name)) tables.set(name, []);
          continue;
        }
        if (/^PRAGMA/i.test(statement)) continue;
        throw new Error(`fakeSqliteDatabase.execAsync: unsupported statement "${statement}"`);
      }
    },

    async runAsync(rawSource: string, boundParams?: SQLiteBindParams) {
      // Repository SQL is written as multi-line template literals for
      // readability; collapse whitespace so `.` in these patterns doesn't
      // need to worry about embedded newlines.
      const source = rawSource.replace(/\s+/g, ' ').trim();
      const params = normalizeParams(boundParams);
      const insert = /^INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i.exec(source);
      if (insert) {
        const [, name, colsRaw] = insert;
        const cols = splitTopLevel(colsRaw!, ',');
        const row: Row = {};
        cols.forEach((col, i) => (row[col] = params[i]));
        table(name!).push(row);
        return { changes: 1, lastInsertRowId: table(name!).length };
      }

      const update = /^UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)$/i.exec(source);
      if (update) {
        const [, name, setRaw, whereRaw] = update;
        const assignments = splitTopLevel(setRaw!, ',').map((a) => {
          const m = /^(\w+)\s*=\s*\?$/.exec(a);
          if (!m) throw new Error(`fakeSqliteDatabase: unsupported SET clause "${a}"`);
          return m[1]!;
        });
        const setValues = params.splice(0, assignments.length);
        const matches = parseWhere(whereRaw, params);
        let changes = 0;
        for (const row of table(name!)) {
          if (!matches(row)) continue;
          assignments.forEach((col, i) => (row[col] = setValues[i]));
          changes += 1;
        }
        return { changes, lastInsertRowId: 0 };
      }

      const del = /^DELETE FROM\s+(\w+)\s+WHERE\s+(.+)$/i.exec(source);
      if (del) {
        const [, name, whereRaw] = del;
        const matches = parseWhere(whereRaw, params);
        const rows = table(name!);
        const remaining = rows.filter((row) => !matches(row));
        const changes = rows.length - remaining.length;
        tables.set(name!, remaining);
        return { changes, lastInsertRowId: 0 };
      }

      throw new Error(`fakeSqliteDatabase.runAsync: unsupported statement "${source}"`);
    },

    async getAllAsync<T>(rawSource: string, boundParams?: SQLiteBindParams): Promise<T[]> {
      const source = rawSource.replace(/\s+/g, ' ').trim();
      const params = normalizeParams(boundParams);
      const select =
        /^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+(\w+)(?:\s+(ASC|DESC))?)?$/i.exec(
          source,
        );
      if (!select) throw new Error(`fakeSqliteDatabase.getAllAsync: unsupported statement "${source}"`);
      const [, colsRaw, name, whereRaw, orderCol, orderDir] = select;
      const matches = parseWhere(whereRaw, params);
      let rows = table(name!).filter(matches).map((row) => ({ ...row }));

      if (orderCol) {
        const dir = orderDir?.toUpperCase() === 'DESC' ? -1 : 1;
        rows = [...rows].sort((a, b) => {
          const av = a[orderCol]!;
          const bv = b[orderCol]!;
          if (av === bv) return 0;
          return (av! > bv! ? 1 : -1) * dir;
        });
      }

      if (colsRaw!.trim() !== '*') {
        const cols = splitTopLevel(colsRaw!, ',');
        rows = rows.map((row) => Object.fromEntries(cols.map((c) => [c, row[c]])));
      }

      return rows as T[];
    },

    async getFirstAsync<T>(source: string, boundParams?: SQLiteBindParams): Promise<T | null> {
      const rows = await db.getAllAsync<T>(source, boundParams);
      return rows[0] ?? null;
    },

    async withTransactionAsync(task: () => Promise<void>): Promise<void> {
      // No real atomicity or rollback — good enough for testing the sequence
      // of calls a migration or repository method makes, not crash recovery.
      await task();
    },

    async closeAsync(): Promise<void> {
      tables.clear();
    },
  };

  return db as unknown as SQLiteDatabase;
}
