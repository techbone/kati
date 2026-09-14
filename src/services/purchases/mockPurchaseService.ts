import type { PurchasePackage, PurchaseResult, PurchaseService } from '@/contracts/services';

import { PACKAGE_IDS } from './constants';

const MOCK_PACKAGES: PurchasePackage[] = [
  {
    identifier: PACKAGE_IDS.monthly,
    priceString: '$2.99',
    title: 'Kati Plus Monthly',
    description: 'Full access, billed monthly',
    trialPeriod: '7 days',
  },
  {
    identifier: PACKAGE_IDS.yearly,
    priceString: '$19.99',
    title: 'Kati Plus Yearly',
    description: 'Full access, billed yearly',
    trialPeriod: '7 days',
  },
  {
    identifier: PACKAGE_IDS.lifetime,
    priceString: '$49.99',
    title: 'Kati Plus Lifetime',
    description: 'Pay once, keep forever',
    trialPeriod: null,
  },
];

/**
 * In-memory PurchaseService for Jest and Expo Go. Same contract as the
 * RevenueCat implementation so UI/tests never need the native module.
 */
export function createMockPurchaseService(options?: {
  initiallyPremium?: boolean;
}): PurchaseService {
  let premium = options?.initiallyPremium ?? false;
  const listeners = new Set<(isPremium: boolean) => void>();

  const notify = () => {
    for (const cb of listeners) cb(premium);
  };

  return {
    async init() {
      notify();
    },

    isPremium() {
      return premium;
    },

    onEntitlementChange(cb) {
      listeners.add(cb);
      cb(premium);
      return () => {
        listeners.delete(cb);
      };
    },

    async getPackages() {
      return MOCK_PACKAGES;
    },

    async purchase(packageIdentifier: string): Promise<PurchaseResult> {
      if (packageIdentifier === 'cancel') return 'cancelled';
      if (packageIdentifier === 'pending') return 'pending';
      if (!MOCK_PACKAGES.some((p) => p.identifier === packageIdentifier)) {
        return 'error';
      }
      premium = true;
      notify();
      return 'purchased';
    },

    async restore() {
      premium = true;
      notify();
      return true;
    },
  };
}
