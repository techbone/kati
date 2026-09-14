/**
 * RevenueCat entitlement identifier. Must match the dashboard exactly.
 * User-facing product name remains "Kati Plus"; in-app gate is `isPremium`.
 */
export const KATI_PLUS_ENTITLEMENT = 'kati_plus_pro';

/** Package identifiers on the current offering — match the RC dashboard. */
export const PACKAGE_IDS = {
  lifetime: 'lifetime',
  yearly: 'yearly',
  monthly: 'monthly',
} as const;

export type KatiPackageId = (typeof PACKAGE_IDS)[keyof typeof PACKAGE_IDS];
