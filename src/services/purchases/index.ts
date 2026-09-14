/**
 * Track C — RevenueCat purchases.
 *
 * Handoff for Track B (wire in root layout + settings; do not edit here):
 * 1. `await purchaseService.init()` once after hydrate.
 * 2. `purchaseService.onEntitlementChange((isPremium) => setPremium(isPremium))`.
 * 3. Settings → Restore → `purchaseService.restore()`.
 * 4. Gates (2nd child / PDF / backup) → `presentPaywallIfNeeded()`.
 * 5. Manage plan → `presentCustomerCenter()` from a non-modal screen.
 *
 * Ops checklist (Abdullah): RC entitlement `kati_plus_pro`; packages
 * `monthly` | `yearly` | `lifetime`; 7-day trial; EAS dev build on three
 * phones; sandbox purchase + restore-after-reinstall; fill eas.json submit
 * IDs; host assets/legal/privacy.html and paste URL into App Store Connect.
 */
export { KATI_PLUS_ENTITLEMENT, PACKAGE_IDS, type KatiPackageId } from './constants';
export { createMockPurchaseService } from './mockPurchaseService';
export {
  formatTrialPeriod,
  hasActiveEntitlement,
  mapPurchasesPackage,
} from './mapPackage';
export {
  presentCustomerCenter,
  presentPaywall,
  presentPaywallIfNeeded,
  type PaywallOutcome,
} from './paywall';
export {
  createRevenueCatPurchaseService,
  purchaseService,
} from './revenueCatPurchaseService';
