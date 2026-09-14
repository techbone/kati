/**
 * THE seam between UI and data.
 *
 * Every screen and hook imports the store from here and nowhere else.
 * M0–M2 this pointed at an in-memory mock so UI could be built before the
 * data layer existed; as of M3 it points at Track A's SQLite-backed store.
 * If a screen ever needs to know which one it's talking to, the contract
 * is wrong — fix `contracts/store.ts`, not the screen.
 */
export { useAppStore } from '@/store/appStore';
export { appSelectors as selectors, scheduleSource } from '@/store/selectors';
