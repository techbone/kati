import type { PermissionState } from '@/contracts/services';

/** Expo permission status strings we care about. */
export type ExpoPermissionStatus = 'granted' | 'denied' | 'undetermined' | string;

/**
 * Maps Expo's permission status onto the frozen contract.
 * Unknown values fall back to `undetermined` so the UI never invents a fourth state.
 */
export function mapPermissionStatus(status: ExpoPermissionStatus): PermissionState {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}
