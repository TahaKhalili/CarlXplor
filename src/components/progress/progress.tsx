import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { formatPercent } from '@/utilities/leaderboard';

type ProgressProps = {
    percent: number;
    style?: StyleProp<ViewStyle>;
};

export default function Progress({ percent, style }: ProgressProps) {
    const clamped = Math.max(0, Math.min(100, percent));

    return (
        <View style={[styles.container, style]}>
            <View style={styles.row}>
                <Text style={styles.label}>Campus explored</Text>
                {/* Same two-decimal format as the leaderboard and profile */}
                <Text style={styles.percent}>{formatPercent(clamped)}</Text>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${clamped}%` }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        minWidth: 180,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1B2A5C',
    },
    percent: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1B2A5C',
        marginLeft: 12,
    },
    track: {
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E6E8EF',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: '#F5C842',
    },
});