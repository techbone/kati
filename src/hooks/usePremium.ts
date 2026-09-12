import { FREE_CHILD_LIMIT, type PremiumFeature } from '@/contracts';
import { useAppStore } from '@/hooks/useStore';

/**
 * The one place feature gates are decided. Screens ask "can I?", never
 * "is premium?", so when RevenueCat lands in M4 nothing in the UI changes.
 */
export function usePremium() {
  const isPremium = useAppStore((s) => s.isPremium);
  const childCount = useAppStore((s) => s.children.length);

  const allows = (feature: PremiumFeature): boolean => {
    if (isPremium) return true;
    switch (feature) {
      case 'multiple-children':
        return childCount < FREE_CHILD_LIMIT;
      case 'pdf-export':
      case 'backup':
        return false;
    }
  };

  return { isPremium, allows };
}
