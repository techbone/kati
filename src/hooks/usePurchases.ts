import { useEffect, useState } from 'react';

import type { PurchasePackage, PurchaseResult } from '@/contracts';
import { mockPurchaseService } from '@/services/mock/mockPurchaseService';
import { useAppStore } from '@/hooks/useStore';

/**
 * PLACEHOLDER seam: swaps to the real RevenueCat-backed service in M4. Screens
 * only ever call this hook, never the service directly, so that swap is
 * confined to this one file.
 */
export function usePurchases() {
  const setPremium = useAppStore((s) => s.setPremium);
  const [packages, setPackages] = useState<PurchasePackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = mockPurchaseService.onEntitlementChange(setPremium);
    mockPurchaseService.init().then(() => setPremium(mockPurchaseService.isPremium()));
    mockPurchaseService
      .getPackages()
      .then(setPackages)
      .finally(() => setLoadingPackages(false));
    return unsubscribe;
  }, [setPremium]);

  async function purchase(identifier: string): Promise<PurchaseResult> {
    setPurchasing(identifier);
    try {
      return await mockPurchaseService.purchase(identifier);
    } finally {
      setPurchasing(null);
    }
  }

  async function restore(): Promise<boolean> {
    setPurchasing('restore');
    try {
      return await mockPurchaseService.restore();
    } finally {
      setPurchasing(null);
    }
  }

  return { packages, loadingPackages, purchasing, purchase, restore };
}
