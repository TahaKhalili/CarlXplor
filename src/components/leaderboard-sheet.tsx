import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from '@/components/press-scale';
import Ring from '@/components/progress/ring';
import { API_BASE_URL, USER_ID } from '@/location';
import {
    formatPercent,
    getBadge,
    getSampleEntries,
    rankEntries,
    USE_SAMPLE_DATA,
    type LeaderboardEntry,
    type RankedEntry,
} from '@/utilities/leaderboard';

const CARLETON_BLUE = '#003069';

// Also used by the profile sheet, so the two screens match.
export const palettes = {
  light: {
    background: '#E4E8EF',
    card: '#FFFFFF',
    text: '#1B2A5C',
    secondary: '#55607F',
    separator: '#E6E8EF',
    ring: CARLETON_BLUE,
    track: '#E6E8EF',
    onRing: '#FFFFFF',
    platinum: '#8E8E93',
    youCard: '#FFFFFF',
    youTrack: '#E6E8EF',
    youRow: '#EEF4FF', // your row when it shows up inside the list
    closeButton: '#8E9199',
    closeIcon: '#FFFFFF',
  },
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    secondary: '#AEAEB2',
    separator: '#38383A',
    ring: '#6AA5E0',
    track: '#38383A',
    onRing: '#000000',
    platinum: '#C7C7CC',
    youCard: '#1C1C1E',
    youTrack: '#38383A',
    youRow: '#12305C',
    closeButton: '#636366',
    closeIcon: '#FFFFFF',
  },
};

export type Palette = typeof palettes.light;

async function loadEntries(percent?: number): Promise<LeaderboardEntry[]> {
  if (USE_SAMPLE_DATA) return getSampleEntries(USER_ID, new Date(), percent);

  const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
  if (!response.ok) throw new Error(`Server returned status ${response.status}`);
  return response.json();
}

type LeaderboardSheetProps = {
  visible: boolean;
  onClose: () => void;
  percent?: number; // your live percent explored
};

export default function LeaderboardSheet({ visible, onClose, percent }: LeaderboardSheetProps) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palettes.dark : palettes.light;
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    loadEntries(percent)
      .then((data) => {
        if (cancelled) return;
        setEntries(data);
        setFailed(false);
      })
      .catch((error) => {
        console.warn('Could not load the leaderboard:', error);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, attempt, percent]);

  const ranked = entries ? rankEntries(entries) : [];
  const topThree = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const you = ranked.find((entry) => entry.userId === USER_ID);

  // The sheet starts below the status bar on iOS. Android shows it full screen.
  const topPadding = Platform.OS === 'ios' ? 20 : insets.top + 12;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.sheet, { backgroundColor: colors.background, paddingTop: topPadding }]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Leaderboard</Text>
            {entries && (
              <Text style={[styles.subtitle, { color: colors.secondary }]}>
                {ranked.length} Carls exploring campus
              </Text>
            )}
          </View>
          <PressScale
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close leaderboard"
            style={[styles.closeButton, { backgroundColor: colors.closeButton }]}>
            <Ionicons name="close" size={18} color={colors.closeIcon} />
          </PressScale>
        </View>

        {failed && (
          <View style={styles.message}>
            <Text style={[styles.messageText, { color: colors.secondary }]}>
              Couldn&apos;t load the leaderboard.
            </Text>
            <Pressable
              onPress={() => {
                setFailed(false);
                setAttempt(attempt + 1);
              }}
              accessibilityRole="button"
              style={styles.retry}>
              <Text style={[styles.retryText, { color: colors.ring }]}>Try again</Text>
            </Pressable>
          </View>
        )}

        {!failed && !entries && (
          <View style={styles.message}>
            <ActivityIndicator />
          </View>
        )}

        {!failed && entries && (
          <FlatList
            data={rest}
            keyExtractor={(entry) => entry.userId}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View>
                <View style={styles.podium}>
                  {topThree[1] && <PodiumColumn entry={topThree[1]} height={162} colors={colors} />}
                  {topThree[0] && <PodiumColumn entry={topThree[0]} height={196} first colors={colors} />}
                  {topThree[2] && <PodiumColumn entry={topThree[2]} height={138} colors={colors} />}
                </View>
                {rest.length > 0 && (
                  <View style={styles.columnLabels}>
                    <Text style={[styles.columnLabel, styles.rankLabel, { color: colors.secondary }]}>Rank</Text>
                    <Text style={[styles.columnLabel, styles.userLabel, { color: colors.secondary }]}>User</Text>
                    <Text style={[styles.columnLabel, { color: colors.secondary }]}>% explored</Text>
                  </View>
                )}
              </View>
            }
            renderItem={({ item, index }) => (
              <Row
                entry={item}
                isYou={item.userId === USER_ID}
                isFirst={index === 0}
                isLast={index === rest.length - 1}
                colors={colors}
              />
            )}
          />
        )}

        {!failed && you && (
          <View
            style={[
              styles.youBar,
              {
                backgroundColor: colors.background,
                // Inside this sheet the iOS inset includes the tab bar, which left a big gap.
                paddingBottom: Platform.OS === 'ios' ? 34 : insets.bottom + 10,
              },
            ]}>
            <View style={[styles.youCard, styles.cardShadow, { backgroundColor: colors.youCard }]}>
              <View style={styles.ringBox}>
                <RankRing entry={you} size={38} stroke={4} trackColor={colors.youTrack} colors={colors} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.username, styles.bold, { color: colors.text }]} numberOfLines={1}>
                  {you.username}
                </Text>
                <View style={styles.youLine}>
                  <View style={styles.locationHalo}>
                    <View style={styles.locationDot} />
                  </View>
                  <Text style={[styles.caption, { color: colors.secondary }]}>You</Text>
                </View>
              </View>
              <Text style={[styles.percent, { color: colors.text }]}>{formatPercent(you.percent)}</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

type RankRingProps = {
  entry: RankedEntry;
  size: number;
  stroke: number;
  trackColor?: string;
  colors: Palette;
};

// The rank number inside a circle that fills with the percent explored.
// Finishers get a solid disc.
function RankRing({ entry, size, stroke, trackColor, colors }: RankRingProps) {
  let fontSize = size > 44 ? 22 : 13;
  if (entry.rank > 99) fontSize = 11;

  return (
    <Ring
      size={size}
      stroke={stroke}
      percent={entry.percent}
      color={colors.ring}
      trackColor={trackColor ?? colors.track}
      filled={entry.finished}>
      <Text style={[styles.rankNumber, { fontSize, color: entry.finished ? colors.onRing : colors.text }]}>
        {entry.rank}
      </Text>
    </Ring>
  );
}

function BadgeIcon({ entry, colors }: { entry: RankedEntry; colors: Palette }) {
  const badge = getBadge(entry.laps);
  if (!badge) return null;

  return (
    <MaterialCommunityIcons
      name="medal"
      size={20}
      color={badge === 'gold' ? colors.ring : colors.platinum}
      accessibilityLabel={badge === 'gold' ? 'Gold badge' : 'Platinum badge'}
    />
  );
}

type PodiumColumnProps = {
  entry: RankedEntry;
  height: number;
  first?: boolean;
  colors: Palette;
};

// First place uses the same colors as the others. It stands out by being
// taller, having a bigger ring and a crown above the ring.
function PodiumColumn({ entry, height, first, colors }: PodiumColumnProps) {
  return (
    <View style={[styles.column, styles.cardShadow, { height, backgroundColor: colors.card }]}>
      <View style={styles.columnTop}>
        <View style={styles.ringStack}>
          {first && (
            <MaterialCommunityIcons
              name="crown"
              size={22}
              color={colors.text}
              accessibilityLabel="First place"
            />
          )}
          <RankRing entry={entry} size={first ? 56 : 50} stroke={5} colors={colors} />
        </View>
        <BadgeIcon entry={entry} colors={colors} />
      </View>
      <View>
        <Text style={[styles.columnName, { color: colors.text }]} numberOfLines={1}>
          {entry.username}
        </Text>
        <Text style={[styles.columnPercent, { color: colors.text }]}>{formatPercent(entry.percent)}</Text>
        {entry.finished && (
          <Text style={[styles.columnCaption, { color: colors.secondary }]} numberOfLines={1}>
            {entry.hoursLeft}h left on top
          </Text>
        )}
      </View>
    </View>
  );
}

type RowProps = {
  entry: RankedEntry;
  isYou: boolean;
  isFirst: boolean;
  isLast: boolean;
  colors: Palette;
};

function Row({ entry, isYou, isFirst, isLast, colors }: RowProps) {
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: isYou ? colors.youRow : colors.card },
        isFirst && styles.rowFirst,
        isLast && styles.rowLast,
      ]}>
      <View style={styles.ringBox}>
        <RankRing entry={entry} size={38} stroke={4} colors={colors} />
      </View>
      <View
        style={[
          styles.rowContent,
          !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
        ]}>
        <View style={styles.rowText}>
          <View style={styles.nameLine}>
            <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>
              {entry.username}
            </Text>
            <BadgeIcon entry={entry} colors={colors} />
          </View>
          {entry.finished && (
            <Text style={[styles.caption, { color: colors.secondary }]}>
              Finished · {entry.hoursLeft}h left on top
            </Text>
          )}
        </View>
        <Text style={[styles.percent, { color: colors.text }]}>{formatPercent(entry.percent)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  // Loading and error
  message: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  messageText: {
    fontSize: 15,
  },
  retry: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  retryText: {
    fontSize: 17,
    fontWeight: '600',
  },

  // Top three columns
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  // Same soft shadow as the "Campus explored" card on the map
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  column: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  columnTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  ringStack: {
    alignItems: 'center',
  },
  columnName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  columnPercent: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  columnCaption: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Column labels
  columnLabels: {
    flexDirection: 'row',
    marginTop: 22,
    marginBottom: 8,
    paddingLeft: 12,
    paddingRight: 16,
  },
  columnLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  rankLabel: {
    width: 50,
  },
  userLabel: {
    flex: 1,
  },

  // Rows
  row: {
    flexDirection: 'row',
    paddingLeft: 12,
  },
  rowFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  rowLast: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  ringBox: {
    width: 50,
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 16,
    paddingVertical: 8,
  },
  rowText: {
    flex: 1,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  percent: {
    fontSize: 17,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rankNumber: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // Your own row, pinned to the bottom
  youBar: {
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  youCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 16,
  },
  youLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Same blue dot as your location on the map
  locationHalo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});