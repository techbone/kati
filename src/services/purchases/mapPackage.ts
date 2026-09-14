import type { PurchasePackage } from '@/contracts/services';

/** Minimal product shape so mapping stays unit-testable without the native SDK. */
export type IntroPriceLike = {
  periodNumberOfUnits: number;
  periodUnit: string;
};

export type StoreProductLike = {
  title: string;
  description: string;
  priceString: string;
  introPrice: IntroPriceLike | null;
};

export type PurchasesPackageLike = {
  identifier: string;
  product: StoreProductLike;
};

export function formatTrialPeriod(intro: IntroPriceLike | null | undefined): string | null {
  if (!intro || intro.periodNumberOfUnits <= 0) return null;
  const unit = intro.periodUnit.toLowerCase();
  const n = intro.periodNumberOfUnits;
  const plural = n === 1 ? '' : 's';
  return `${n} ${unit}${plural}`;
}

export function mapPurchasesPackage(pkg: PurchasesPackageLike): PurchasePackage {
  return {
    identifier: pkg.identifier,
    priceString: pkg.product.priceString,
    title: pkg.product.title,
    description: pkg.product.description,
    trialPeriod: formatTrialPeriod(pkg.product.introPrice),
  };
}

export function hasActiveEntitlement(
  entitlementsActive: Record<string, unknown> | undefined,
  entitlementId: string,
): boolean {
  return Boolean(entitlementsActive?.[entitlementId]);
}
