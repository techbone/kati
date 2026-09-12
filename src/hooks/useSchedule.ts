import { useMemo } from 'react';

import type { ChildId, ScheduleItem, ScheduleSummary, ScheduleVisit } from '@/contracts';
import { selectors, useAppStore } from '@/hooks/useStore';
import { useToday } from '@/hooks/useToday';

interface Schedule {
  items: ScheduleItem[];
  visits: ScheduleVisit[];
  summary: ScheduleSummary;
}

/** Derived schedule for one child. Recomputes when records change or the day rolls over. */
export function useSchedule(childId: ChildId | null): Schedule | null {
  const today = useToday();
  const children = useAppStore((s) => s.children);
  const recordsByChild = useAppStore((s) => s.recordsByChild);
  const prefs = useAppStore((s) => s.prefs);

  return useMemo(() => {
    if (!childId) return null;
    const state = {
      hydrated: true,
      children,
      activeChildId: childId,
      recordsByChild,
      prefs,
      isPremium: false,
    };
    return {
      items: selectors.selectItems(state, childId, today),
      visits: selectors.selectVisits(state, childId, today),
      summary: selectors.selectSummary(state, childId, today),
    };
  }, [childId, children, recordsByChild, prefs, today]);
}
