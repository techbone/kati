import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesPackage,
} from 'react-native-purchases';

import type { PurchasePackage, PurchaseResult, PurchaseService } from '@/contracts/services';

import { KATI_PLUS_ENTITLEMENT } from './constants';
import { hasActiveEntitlement, mapPurchasesPackage } from './mapPackage';

type Extra = {
  revenueCatApiKey?: string;
};

function readApiKey(): string {
  const extra = Constants.expoConfig?.extra as Extra | undefined;
  const key = extra?.revenueCatApiKey?.trim();
  if (!key) {
    throw new Error(
      'Missing RevenueCat API key. Set extra.revenueCatApiKey in app.config.ts or EXPO_PUBLIC_REVENUECAT_API_KEY.',
    );
  }
  return key;
}

function isPremiumFromCustomerInfo(info: CustomerInfo): boolean {
  return hasActiveEntitlement(info.entitlements.active, KATI_PLUS_ENTITLEMENT);
}

function isPurchasesError(error: unknown): error is { code: unknown; message?: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

/**
 * Real PurchaseService backed by RevenueCat.
 * Call `init()` once early (root layout / store hydrate). Requires an EAS
 * development build — `react-native-purchases` does not run in Expo Go.
 */
export function createRevenueCatPurchaseService(): PurchaseService {
  let premium = false;
  let ready = false;
  const listeners = new Set<(isPremium: boolean) => void>();
  let customerInfoListener: CustomerInfoUpdateListener | null = null;

  const notify = (next: boolean) => {
    premium = next;
    for (const cb of listeners) cb(premium);
  };

  const applyCustomerInfo = (info: CustomerInfo) => {
    notify(isPremiumFromCustomerInfo(info));
  };

  return {
    async init() {
      if (ready) return;
      if (Platform.OS === 'web') {
        ready = true;
        return;
      }

      const apiKey = readApiKey();
      await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
      Purchases.configure({ apiKey });

      customerInfoListener = (info) => applyCustomerInfo(info);
      Purchases.addCustomerInfoUpdateListener(customerInfoListener);

      try {
        const info = await Purchases.getCustomerInfo();
        applyCustomerInfo(info);
      } catch (error) {
        if (__DEV__) {
          console.warn('[purchases] getCustomerInfo failed after configure', error);
        }
      }

      ready = true;
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

    async getPackages(): Promise<PurchasePackage[]> {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) return [];
      return current.availablePackages.map((pkg: PurchasesPackage) =>
        mapPurchasesPackage({
          identifier: pkg.identifier,
          product: {
            title: pkg.product.title,
            description: pkg.product.description,
            priceString: pkg.product.priceString,
            introPrice: pkg.product.introPrice
              ? {
                  periodNumberOfUnits: pkg.product.introPrice.periodNumberOfUnits,
                  periodUnit: String(pkg.product.introPrice.periodUnit),
                }
              : null,
          },
        }),
      );
    },

    async purchase(packageIdentifier: string): Promise<PurchaseResult> {
      try {
        const offerings = await Purchases.getOfferings();
        const pkg = offerings.current?.availablePackages.find((p) => p.identifier === packageIdentifier);
        if (!pkg) {
          if (__DEV__) {
            console.warn(`[purchases] package not found: ${packageIdentifier}`);
          }
          return 'error';
        }

        const { customerInfo } = await Purchases.purchasePackage(pkg);
        applyCustomerInfo(customerInfo);
        return isPremiumFromCustomerInfo(customerInfo) ? 'purchased' : 'error';
      } catch (error) {
        if (
          isPurchasesError(error) &&
          error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
        ) {
          return 'cancelled';
        }
        if (
          isPurchasesError(error) &&
          error.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR
        ) {
          return 'pending';
        }
        if (__DEV__) {
          console.warn('[purchases] purchase failed', error);
        }
        return 'error';
      }
    },

    async restore() {
      try {
        const info = await Purchases.restorePurchases();
        applyCustomerInfo(info);
        return isPremiumFromCustomerInfo(info);
      } catch (error) {
        if (__DEV__) {
          console.warn('[purchases] restore failed', error);
        }
        return false;
      }
    },
  };
}

/** Shared singleton for the app. Prefer this over constructing multiple instances. */
export const purchaseService: PurchaseService = createRevenueCatPurchaseService();
