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

const palettes = {
  light: {
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    secondary: '#636366',
    separator: '#E5E5EA',
    ring: CARLETON_BLUE,
    track: '#E5E5EA',
    onRing: '#FFFFFF',
    platinum: '#8E8E93',
    firstCard: '#000000',
    firstText: '#FFFFFF',
    firstSecondary: '#C7C7CC',
    firstRing: '#FFFFFF',
    firstTrack: '#3A3A3C',
    firstOnRing: CARLETON_BLUE,
    youCard: '#DCE9FF',
    youTrack: '#FFFFFF',
    closeButton: '#E3E3E8',
    closeIcon: '#3C3C43',
    barBorder: '#D1D1D6',
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
    firstCard: '#FFFFFF',
    firstText: '#000000',
    firstSecondary: '#636366',
    firstRing: CARLETON_BLUE,
    firstTrack: '#E5E5EA',
    firstOnRing: '#FFFFFF',
    youCard: '#12305C',
    youTrack: '#1C1C1E',
    closeButton: '#2C2C2E',
    closeIcon: '#EBEBF5',
    barBorder: '#38383A',
  },
};

type Palette = typeof palettes.light;

async function loadEntries(): Promise<LeaderboardEntry[]> {
  if (USE_SAMPLE_DATA) return getSampleEntries(USER_ID);

  const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
  if (!response.ok) throw new Error(`Server returned status ${response.status}`);
  return response.json();
}

type LeaderboardSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export default function LeaderboardSheet({ visible, onClose }: LeaderboardSheetProps) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palettes.dark : palettes.light;
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    loadEntries()
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
  }, [visible, attempt]);

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
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close leaderboard"
            style={[styles.closeButton, { backgroundColor: colors.closeButton }]}>
            <Ionicons name="close" size={18} color={colors.closeIcon} />
          </Pressable>
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
                  {topThree[0] && <PodiumColumn entry={topThree[0]} height={190} first colors={colors} />}
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
              { backgroundColor: colors.background, borderTopColor: colors.barBorder, paddingBottom: insets.bottom + 10 },
            ]}>
            <View style={[styles.youCard, { backgroundColor: colors.youCard }]}>
              <View style={styles.ringBox}>
                <RankRing entry={you} size={38} stroke={4} trackColor={colors.youTrack} colors={colors} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.username, styles.bold, { color: colors.text }]} numberOfLines={1}>
                  {you.username}
                </Text>
                <Text style={[styles.caption, { color: colors.text }]}>You</Text>
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
  first?: boolean;
  trackColor?: string;
  colors: Palette;
};

// The rank number inside a circle that fills with the percent explored.
// Finishers get a solid disc.
function RankRing({ entry, size, stroke, first, trackColor, colors }: RankRingProps) {
  const ringColor = first ? colors.firstRing : colors.ring;
  const onRing = first ? colors.firstOnRing : colors.onRing;
  const numberColor = first ? colors.firstText : colors.text;

  let fontSize = size > 44 ? 22 : 13;
  if (entry.rank > 99) fontSize = 11;

  return (
    <Ring
      size={size}
      stroke={stroke}
      percent={entry.percent}
      color={ringColor}
      trackColor={trackColor ?? (first ? colors.firstTrack : colors.track)}
      filled={entry.finished}>
      <Text style={[styles.rankNumber, { fontSize, color: entry.finished ? onRing : numberColor }]}>
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

function PodiumColumn({ entry, height, first, colors }: PodiumColumnProps) {
  const textColor = first ? colors.firstText : colors.text;
  const secondaryColor = first ? colors.firstSecondary : colors.secondary;

  return (
    <View style={[styles.column, { height, backgroundColor: first ? colors.firstCard : colors.card }]}>
      <View style={styles.columnTop}>
        <RankRing entry={entry} size={first ? 60 : 50} stroke={5} first={first} colors={colors} />
        {!first && <BadgeIcon entry={entry} colors={colors} />}
      </View>
      <View>
        <Text style={[styles.columnName, { color: textColor }]} numberOfLines={1}>
          {entry.username}
        </Text>
        <Text style={[styles.columnPercent, { color: textColor }]}>{formatPercent(entry.percent)}</Text>
        {entry.finished && (
          <Text style={[styles.columnCaption, { color: secondaryColor }]} numberOfLines={1}>
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
        { backgroundColor: isYou ? colors.youCard : colors.card },
        isFirst && styles.rowFirst,
        isLast && styles.rowLast,
      ]}>
      <View style={styles.ringBox}>
        <RankRing
          entry={entry}
          size={38}
          stroke={4}
          trackColor={isYou ? colors.youTrack : undefined}
          colors={colors}
        />
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
    width: 30,
    height: 30,
    borderRadius: 15,
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
    gap: 6,
  },
  column: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  columnTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  rowLast: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  youCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderRadius: 18,
    paddingLeft: 12,
    paddingRight: 16,
  },
});