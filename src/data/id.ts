/**
 * Local, offline-only ids. Not cryptographically strong — this app has no
 * backend and never syncs, so the only requirement is "doesn't collide on
 * one device", which time plus a random suffix comfortably satisfies.
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
