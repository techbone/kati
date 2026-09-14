import { formatTrialPeriod, hasActiveEntitlement, mapPurchasesPackage } from '../mapPackage';
import { KATI_PLUS_ENTITLEMENT } from '../constants';

describe('purchases/mapPackage', () => {
  it('formats intro trial periods', () => {
    expect(
      formatTrialPeriod({ periodNumberOfUnits: 7, periodUnit: 'DAY' }),
    ).toBe('7 days');
    expect(
      formatTrialPeriod({ periodNumberOfUnits: 1, periodUnit: 'WEEK' }),
    ).toBe('1 week');
    expect(formatTrialPeriod(null)).toBeNull();
  });

  it('maps a RevenueCat-like package into the contract shape', () => {
    expect(
      mapPurchasesPackage({
        identifier: 'yearly',
        product: {
          title: 'Yearly',
          description: '12 months',
          priceString: '$19.99',
          introPrice: { periodNumberOfUnits: 7, periodUnit: 'day' },
        },
      }),
    ).toEqual({
      identifier: 'yearly',
      title: 'Yearly',
      description: '12 months',
      priceString: '$19.99',
      trialPeriod: '7 days',
    });
  });

  it('detects the active entitlement', () => {
    expect(
      hasActiveEntitlement({ [KATI_PLUS_ENTITLEMENT]: {} }, KATI_PLUS_ENTITLEMENT),
    ).toBe(true);
    expect(hasActiveEntitlement({}, KATI_PLUS_ENTITLEMENT)).toBe(false);
    expect(hasActiveEntitlement(undefined, KATI_PLUS_ENTITLEMENT)).toBe(false);
  });
});
