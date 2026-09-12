import { EmptyState, Screen } from '@/ui/components';

/** M3: the clinic-showable record. Placeholder until then. */
export default function CardTab() {
  return (
    <Screen>
      <EmptyState
        icon="doc.text.fill"
        title="Immunization card"
        body="A printable record of every dose, ready to show at the clinic. Coming in the next milestone."
      />
    </Screen>
  );
}
