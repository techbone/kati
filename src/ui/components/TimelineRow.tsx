import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ScheduleItemStatus } from '@/contracts';
import { useTheme } from '@/hooks/useTheme';

interface TimelineRowProps extends PropsWithChildren {
  status: ScheduleItemStatus;
  complete: boolean;
  first: boolean;
  last: boolean;
}

const RAIL = 22;
const DOT = 12;
const DOT_TOP = 22;

/**
 * The rail down the left of the schedule: one dot per clinic visit, a line
 * joining them, birth at the top. It turns a list of cards into a journey —
 * the thing a parent is actually on.
 */
export function TimelineRow({ status, complete, first, last, children }: TimelineRowProps) {
  const theme = useTheme();
  const c = theme.colors;
  const dotColor = complete ? c.given : status === 'upcoming' ? c.line : c[status];
  const ringColor = complete ? c.given : status === 'upcoming' ? c.inkSoft : c[status];

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        {!first ? (
          <View style={[styles.line, styles.lineTop, { backgroundColor: c.line }]} />
        ) : null}
        {!last ? (
          <View style={[styles.line, styles.lineBottom, { backgroundColor: c.line }]} />
        ) : null}
        <View
          style={[
            styles.dot,
            {
              backgroundColor: complete || status !== 'upcoming' ? dotColor : c.bg,
              borderColor: ringColor,
            },
          ]}
        />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  rail: { width: RAIL, alignItems: 'center' },
  line: { position: 'absolute', width: 2, left: RAIL / 2 - 1 },
  lineTop: { top: 0, height: DOT_TOP },
  lineBottom: { top: DOT_TOP + DOT, bottom: 0 },
  dot: {
    position: 'absolute',
    top: DOT_TOP,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
  },
  content: { flex: 1, paddingLeft: 6 },
});
