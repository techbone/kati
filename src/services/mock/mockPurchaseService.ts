/**
 * PLACEHOLDER until Track C wires react-native-purchases in M4.
 *
 * Same shape RevenueCat will fill: one annual package with a 7-day trial
 * (Shipaton requires a trial or a judge promo code — we're doing the trial).
 * `purchase()` always succeeds after a short delay so the paywall flow is
 * fully testable without a sandbox account.
 */
import type { PurchasePackage, PurchaseResult, PurchaseService } from '@/contracts';

const PACKAGE: PurchasePackage = {
  identifier: 'kati_plus_annual',
  priceString: '₦4,999/year',
  title: 'Kati Plus',
  description: 'Unlimited children, PDF export, and backup.',
  trialPeriod: '7 days',
};

type Listener = (isPremium: boolean) => void;

function createMockPurchaseService(): PurchaseService {
  let premium = false;
  const listeners = new Set<Listener>();

  function setPremium(next: boolean) {
    if (next === premium) return;
    premium = next;
    listeners.forEach((cb) => cb(premium));
  }

  return {
    async init() {},
    isPremium: () => premium,
    onEntitlementChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async getPackages() {
      return [PACKAGE];
    },
    async purchase(packageIdentifier): Promise<PurchaseResult> {
      if (packageIdentifier !== PACKAGE.identifier) return 'error';
      await new Promise((r) => setTimeout(r, 600));
      setPremium(true);
      return 'purchased';
    },
    async restore() {
      await new Promise((r) => setTimeout(r, 400));
      setPremium(true);
      return premium;
    },
  };
}

export const mockPurchaseService = createMockPurchaseService();
