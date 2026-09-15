import { Linking, Pressable, StyleSheet, View } from 'react-native';

import type { Child, ScheduleSummary, ScheduleVisit } from '@/contracts';
import { useFontScale } from '@/hooks/useFontScale';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/ui/components/Icon';
import { Text } from '@/ui/components/Text';
import { dateToISO, formatDate, formatDateLong } from '@/ui/format';

interface RecordCardProps {
  child: Child;
  visits: ScheduleVisit[];
  summary: ScheduleSummary;
  scheduleSource: string;
  /** Tapping the source line opens this. */
  scheduleUrl?: string;
  today: Date;
}

const SEX_LABEL = { female: 'Female', male: 'Male', unspecified: '—' } as const;

/**
 * The paper child health card, as a document. Dense, ruled, tabular — built
 * to be read by a nurse in a queue, and to be the screenshot in the listing.
 * Layout mirrors the printed card: header block, then one ruled row per dose,
 * grouped under a visit heading.
 */
export function RecordCard({
  child,
  visits,
  summary,
  scheduleSource,
  scheduleUrl,
  today,
}: RecordCardProps) {
  const theme = useTheme();
  const c = theme.colors;
  // Date columns are fixed-width so the table reads as a table; they grow with
  // text so 'Wed 23 Sep' never wraps to two lines at accessibility sizes.
  const colDate = { width: 92 * useFontScale(1.6) };

  return (
    <View
      accessibilityLabel={`Immunization record for ${child.name}`}
      style={[
        styles.sheet,
        { backgroundColor: c.surface, borderColor: c.line, borderRadius: theme.radius.md },
      ]}
    >
      {/* Header block */}
      <View
        style={[
          styles.header,
          { padding: theme.space.lg, gap: theme.space.md, borderBottomColor: c.ink },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={{ gap: 2 }}>
            <Text variant="label" color="inkMuted">
              Immunization record
            </Text>
            <Text variant="title">{child.name}</Text>
          </View>
          <View style={[styles.stamp, { borderColor: c.primary, borderRadius: theme.radius.sm }]}>
            <Text variant="label" color="primary">
              {summary.givenCount}/{summary.totalDoses}
            </Text>
          </View>
        </View>
        <View style={[styles.meta, { gap: theme.space.lg }]}>
          <Meta label="Date of birth" value={formatDateLong(child.birthDate)} />
          <Meta label="Sex" value={SEX_LABEL[child.sex]} />
        </View>
      </View>

      {/* Column headings */}
      <View
        style={[
          styles.row,
          styles.headRow,
          { paddingHorizontal: theme.space.lg, borderBottomColor: c.line },
        ]}
      >
        <Text variant="label" color="inkSoft" style={styles.colVaccine}>
          Vaccine
        </Text>
        <Text variant="label" color="inkSoft" style={colDate}>
          Due
        </Text>
        <Text variant="label" color="inkSoft" style={colDate}>
          Given
        </Text>
      </View>

      {visits.map((visit) => (
        <View key={visit.visitId}>
          <View
            style={[
              styles.visitRow,
              { backgroundColor: c.surfaceMuted, paddingHorizontal: theme.space.lg },
            ]}
          >
            <Text variant="caption" color="inkMuted" style={styles.visitLabel}>
              {visit.visitLabel}
            </Text>
          </View>
          {visit.items.map((item, i) => {
            const given = item.status === 'given';
            const skipped = item.status === 'skipped';
            const overdue = item.status === 'overdue';
            return (
              <View
                key={item.dose.id}
                accessible
                accessibilityLabel={`${item.dose.shortName} ${item.dose.doseLabel}, due ${formatDate(item.dueDate)}, ${
                  given && item.record?.givenDate
                    ? `given ${formatDate(item.record.givenDate)}`
                    : skipped
                      ? 'skipped'
                      : 'not yet given'
                }`}
                style={[
                  styles.row,
                  {
                    paddingHorizontal: theme.space.lg,
                    borderBottomColor: c.line,
                    borderBottomWidth: i === visit.items.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View style={styles.colVaccine}>
                  <Text variant="callout">{item.dose.shortName}</Text>
                  <Text variant="caption" color="inkSoft">
                    {item.dose.doseLabel}
                  </Text>
                </View>
                <Text
                  variant="callout"
                  color={overdue ? 'overdue' : 'inkMuted'}
                  style={[colDate, styles.tabular]}
                >
                  {formatDate(item.dueDate)}
                </Text>
                <View style={[colDate, styles.givenCell]}>
                  {given && item.record?.givenDate ? (
                    <>
                      <Icon name="checkmark" size={11} color="given" weight="bold" />
                      <Text variant="callout" color="given" style={styles.tabular}>
                        {formatDate(item.record.givenDate)}
                      </Text>
                    </>
                  ) : skipped ? (
                    <Text variant="callout" color="inkSoft">
                      Skipped
                    </Text>
                  ) : (
                    <Text variant="callout" color="inkSoft">
                      —
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ))}

      <View style={[styles.footer, { padding: theme.space.lg, borderTopColor: c.line, gap: 2 }]}>
        {scheduleUrl ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${scheduleSource}. Opens in browser.`}
            onPress={() => Linking.openURL(scheduleUrl)}
          >
            <Text variant="caption" color="primary">
              {scheduleSource}
            </Text>
          </Pressable>
        ) : (
          <Text variant="caption" color="inkSoft">
            {scheduleSource}
          </Text>
        )}
        <Text variant="caption" color="inkSoft">
          Generated {formatDateLong(dateToISO(today))} · Kati · Record-keeping aid, not medical
          advice
        </Text>
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 1 }}>
      <Text variant="label" color="inkSoft">
        {label}
      </Text>
      <Text variant="callout">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  header: { borderBottomWidth: 2 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  stamp: { borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  meta: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingVertical: 8, gap: 8 },
  headRow: { minHeight: 32, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  visitRow: { paddingVertical: 4 },
  visitLabel: { fontWeight: '600' },
  colVaccine: { flex: 1 },
  givenCell: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tabular: { fontVariant: ['tabular-nums'] },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
});
