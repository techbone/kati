import type { Child } from '@/contracts';
import { useAppStore } from '@/hooks/useStore';

export function useActiveChild(): Child | null {
  const id = useAppStore((s) => s.activeChildId);
  const children = useAppStore((s) => s.children);
  return children.find((c) => c.id === id) ?? null;
}
