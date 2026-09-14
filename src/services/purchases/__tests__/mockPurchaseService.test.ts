import { createMockPurchaseService } from '../mockPurchaseService';
import { PACKAGE_IDS } from '../constants';

describe('purchases/mockPurchaseService', () => {
  it('starts free and unlocks after a successful purchase', async () => {
    const service = createMockPurchaseService();
    await service.init();
    expect(service.isPremium()).toBe(false);

    const seen: boolean[] = [];
    const unsub = service.onEntitlementChange((v) => {
      seen.push(v);
    });

    expect(await service.purchase(PACKAGE_IDS.yearly)).toBe('purchased');
    expect(service.isPremium()).toBe(true);
    expect(seen).toContain(true);

    unsub();
  });

  it('maps cancel / unknown package identifiers', async () => {
    const service = createMockPurchaseService();
    expect(await service.purchase('cancel')).toBe('cancelled');
    expect(await service.purchase('nope')).toBe('error');
  });

  it('lists the three configured packages', async () => {
    const service = createMockPurchaseService();
    const packages = await service.getPackages();
    expect(packages.map((p) => p.identifier)).toEqual([
      PACKAGE_IDS.monthly,
      PACKAGE_IDS.yearly,
      PACKAGE_IDS.lifetime,
    ]);
  });
});
