/**
 * BackupService is deferred until Track A lands backup JSON serialize +
 * import validation (M4). Track C will then implement file I/O + share via
 * expo-file-system / expo-sharing on top of A's helpers — not invent SQLite
 * writes from this layer.
 *
 * Contract (frozen): ExportService-adjacent BackupService in
 * `src/contracts/services.ts` — export / import / shareBackupFile.
 */

export {};
