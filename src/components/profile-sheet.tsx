import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palettes, type Palette } from '@/components/leaderboard-sheet';
import { PressScale } from '@/components/press-scale';
import Ring from '@/components/progress/ring';
import { USER_ID } from '@/location';
import { formatPercent, getBadge, getSampleEntries, ordinal, rankEntries } from '@/utilities/leaderboard';

type ProfileSheetProps = {
  visible: boolean;
  onClose: () => void;
  percent: number; // your live percent explored
  username?: string;
  email?: string;
  onLogOut?: () => void;
};

// Bottom sheet with your profile. Same Modal structure as the teammate's
// profile popup on feat/authorization, so the two merge easily later.
export default function ProfileSheet({ visible, onClose, percent, username, email, onLogOut }: ProfileSheetProps) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palettes.dark : palettes.light;
  const insets = useSafeAreaInsets();

  // Same call the leaderboard uses, so both screens always agree.
  const ranked = rankEntries(getSampleEntries(USER_ID, new Date(), percent));
  const you = ranked.find((entry) => entry.userId === USER_ID);
  const rank = you?.rank ?? ranked.length;
  const badge = getBadge(you?.laps);

  const name = username ?? you?.username ?? 'Carl';
  const mail = email ?? `${name}@carleton.edu`;

  function handleLogOut() {
    // Sign-in will plug in here: pass onLogOut once Clerk is set up.
    if (onLogOut) onLogOut();
    else onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onClose}
          accessibilityLabel="Close profile"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              // Same bottom padding as the leaderboard
              paddingBottom: Platform.OS === 'ios' ? 34 : insets.bottom + 10,
            },
          ]}
          onStartShouldSetResponder={() => true}>
          {/* 1. Header */}
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: colors.closeButton }]}>
              <MaterialIcons name="person" size={34} color="#FFFFFF" />
              <View style={styles.pencilBadge}>
                <MaterialIcons name="edit" size={12} color={colors.closeButton} />
              </View>
            </View>
            <View style={styles.identity}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {name}
              </Text>
              <Text style={[styles.email, { color: colors.secondary }]} numberOfLines={1}>
                {mail}
              </Text>
            </View>
            <PressScale
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close profile"
              style={[styles.closeButton, { backgroundColor: colors.closeButton }]}>
              <Ionicons name="close" size={18} color={colors.closeIcon} />
            </PressScale>
          </View>

          {/* 2. Stats */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.statsRow}>
              <Ring size={64} stroke={6} percent={percent} color={colors.ring} trackColor={colors.track}>
                <Text style={[styles.ringRank, { color: colors.text }]}>{rank}</Text>
              </Ring>
              <View style={styles.statsMain}>
                <Text style={[styles.bigPercent, { color: colors.text }]}>{formatPercent(percent)}</Text>
                <Text style={[styles.small, { color: colors.secondary }]}>of campus explored</Text>
              </View>
              <View style={styles.statsSide}>
                <Text style={[styles.rankText, { color: colors.text }]}>{ordinal(rank)}</Text>
                <Text style={[styles.small, { color: colors.secondary }]}>of {ranked.length} Carls</Text>
              </View>
            </View>

            <View style={[styles.separator, { backgroundColor: colors.separator }]} />

            <View style={styles.badgeRow}>
              <MaterialCommunityIcons name="medal" size={20} color={colors.platinum} />
              <Text style={[styles.badgeText, { color: colors.text }]}>
                {badge === 'platinum' ? 'Platinum badge' : badge === 'gold' ? 'Gold badge' : 'No badges yet'}
              </Text>
              {!badge && (
                <Text style={[styles.tiny, { color: colors.secondary }]}>Finish the map to earn one</Text>
              )}
            </View>
          </View>

          {/* 3. Menu (rows do nothing yet) */}
          <View style={[styles.card, styles.menuCard, { backgroundColor: colors.card }]}>
            <MenuRow icon="edit-note" label="My Notes" soon colors={colors} />
            <MenuRow icon="bar-chart" label="My Stats" separator colors={colors} />
            <MenuRow icon="settings" label="Settings" separator colors={colors} />
          </View>

          {/* 4. Log out */}
          <PressScale onPress={handleLogOut} accessibilityRole="button" style={styles.logOut}>
            <Text style={styles.logOutLabel}>Log out</Text>
          </PressScale>
        </View>
      </View>
    </Modal>
  );
}

type MenuRowProps = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  soon?: boolean; // shows a small "Soon" before the chevron
  separator?: boolean; // thin line above the row
  colors: Palette;
};

function MenuRow({ icon, label, soon, separator, colors }: MenuRowProps) {
  return (
    <View style={styles.menuRow}>
      <MaterialIcons name={icon} size={22} color={colors.text} />
      <View
        style={[
          styles.menuRowContent,
          separator && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
        ]}>
        <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
        {soon && <Text style={[styles.tiny, { color: colors.secondary }]}>Soon</Text>}
        <MaterialIcons name="chevron-right" size={22} color={colors.secondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    paddingTop: 24,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pencilBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    marginTop: 2,
  },
  // Same round gray button as the leaderboard
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // White card, same as the leaderboard
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ringRank: {
    fontSize: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statsMain: {
    flex: 1,
  },
  bigPercent: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statsSide: {
    alignItems: 'flex-end',
  },
  rankText: {
    fontSize: 20,
    fontWeight: '700',
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    flex: 1,
    fontSize: 15,
  },
  tiny: {
    fontSize: 12,
  },

  // Menu
  menuCard: {
    paddingVertical: 0,
    paddingRight: 0,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuRowContent: {
    flex: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 17,
  },

  // Log out
  logOut: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logOutLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
