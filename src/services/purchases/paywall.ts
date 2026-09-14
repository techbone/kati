import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

import { KATI_PLUS_ENTITLEMENT } from './constants';

export type PaywallOutcome = 'unlocked' | 'cancelled' | 'error' | 'not_presented';

function mapPaywallResult(result: PAYWALL_RESULT): PaywallOutcome {
  switch (result) {
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      return 'unlocked';
    case PAYWALL_RESULT.CANCELLED:
      return 'cancelled';
    case PAYWALL_RESULT.NOT_PRESENTED:
      return 'not_presented';
    case PAYWALL_RESULT.ERROR:
    default:
      return 'error';
  }
}

/**
 * Presents the RevenueCat dashboard paywall for the current offering.
 * Prefer this over hand-rolling a paywall screen for Shipaton.
 */
export async function presentPaywall(): Promise<PaywallOutcome> {
  try {
    const result = await RevenueCatUI.presentPaywall();
    return mapPaywallResult(result);
  } catch (error) {
    if (__DEV__) {
      console.warn('[purchases] presentPaywall failed', error);
    }
    return 'error';
  }
}

/**
 * Shows the paywall only when `kati_plus_pro` is not active.
 * Use when gating multiple-children / PDF export / backup.
 */
export async function presentPaywallIfNeeded(): Promise<PaywallOutcome> {
  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: KATI_PLUS_ENTITLEMENT,
    });
    return mapPaywallResult(result);
  } catch (error) {
    if (__DEV__) {
      console.warn('[purchases] presentPaywallIfNeeded failed', error);
    }
    return 'error';
  }
}

/**
 * Self-serve manage / restore / cancel UI. Call from Settings when the user
 * already has Kati Plus (or wants to restore). Prefer presenting from a
 * non-modal screen — `presentCustomerCenter` cannot stack on another modal.
 */
export async function presentCustomerCenter(): Promise<void> {
  try {
    await RevenueCatUI.presentCustomerCenter({
      callbacks: {
        onRestoreCompleted: ({ customerInfo }) => {
          if (__DEV__) {
            const active = customerInfo.entitlements.active[KATI_PLUS_ENTITLEMENT];
            console.log(
              '[purchases] customer center restore',
              active ? 'entitlement active' : 'no entitlement',
            );
          }
        },
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[purchases] presentCustomerCenter failed', error);
    }
    throw error;
  }
}
