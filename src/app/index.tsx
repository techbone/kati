import { Redirect } from 'expo-router';

import { useAppStore } from '@/hooks/useStore';

/** Boot gate: straight to the schedule if a child exists, otherwise onboarding. */
export default function Index() {
  const onboarded = useAppStore((s) => s.prefs.onboarded);
  const hasChild = useAppStore((s) => s.children.length > 0);

  return <Redirect href={onboarded && hasChild ? '/(tabs)' : '/(onboarding)'} />;
}
