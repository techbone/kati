/**
 * Which service implementation the UI talks to.
 *
 * Expo Go can't load native modules, so RevenueCat's SDK and paywall are
 * swapped for Track C's in-memory mock there. A development or production
 * build gets the real thing. Screens import from here and never decide this
 * themselves — the same rule as `useStore.ts`.
 */
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Alert } from 'react-native';

import { exportService } from '@/services/export';
import { notificationService } from '@/services/notifications';
import {
  createMockPurchaseService,
  PACKAGE_IDS,
  presentCustomerCenter as realPresentCustomerCenter,
  presentPaywallIfNeeded as realPresentPaywallIfNeeded,
  purchaseService as realPurchaseService,
  type PaywallOutcome,
} from '@/services/purchases';

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const purchaseService = isExpoGo ? createMockPurchaseService() : realPurchaseService;

export { exportService, notificationService };
export type { PaywallOutcome };

/**
 * Shows RevenueCat's dashboard paywall unless Kati Plus is already active.
 * In Expo Go there is no native paywall, so a plain alert stands in and
 * drives the mock — enough to exercise every gate without a dev build.
 */
export async function presentPaywallIfNeeded(): Promise<PaywallOutcome> {
  if (!isExpoGo) return realPresentPaywallIfNeeded();
  if (purchaseService.isPremium()) return 'not_presented';

  return new Promise((resolve) => {
    Alert.alert(
      'Kati Plus (Expo Go preview)',
      'The real paywall needs a development build. Simulate a purchase?',
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve('cancelled') },
        {
          text: 'Start free trial',
          onPress: async () => {
            const result = await purchaseService.purchase(PACKAGE_IDS.yearly);
            resolve(result === 'purchased' ? 'unlocked' : 'error');
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve('cancelled') },
    );
  });
}

/** Self-serve manage / cancel / restore. Real build only — nothing to manage in Expo Go. */
export async function presentCustomerCenter(): Promise<void> {
  if (isExpoGo) {
    Alert.alert('Manage plan', 'Available in a development or App Store build.');
    return;
  }
  await realPresentCustomerCenter();
}
