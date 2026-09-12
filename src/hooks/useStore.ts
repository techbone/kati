/**
 * THE seam between UI and data.
 *
 * Every screen and hook imports the store from here and nowhere else. When
 * Track A's real store lands (M3), these two lines change and nothing else
 * in src/app, src/ui or src/hooks should need to.
 */
export { useMockStore as useAppStore } from '@/services/mock/mockStore';
export { mockSelectors as selectors } from '@/services/mock/mockSelectors';
