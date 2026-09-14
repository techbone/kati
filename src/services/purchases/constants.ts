/**
 * Must match the entitlement identifier in the RevenueCat dashboard exactly.
 * Project docs historically said `kati_plus`; dashboard is configured as
 * `kati_plus_pro`. Gates stay the same in the store (`isPremium`).
 */
export const KATI_PLUS_ENTITLEMENT = 'kati_plus_pro';

/** Package identifiers on the current offering — match the RC dashboard. */
export const PACKAGE_IDS = {
  lifetime: 'lifetime',
  yearly: 'yearly',
  monthly: 'monthly',
} as const;

export type KatiPackageId = (typeof PACKAGE_IDS)[keyof typeof PACKAGE_IDS];
