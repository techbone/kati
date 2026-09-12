import { EmptyState, Screen } from '@/ui/components';

/** M2: reminders, child management, restore purchases. Placeholder until then. */
export default function SettingsTab() {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="gearshape.fill"
        title="Settings"
        body="Reminder times, your children, and backups. Coming in the next milestone."
      />
    </Screen>
  );
}
