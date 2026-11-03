import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CampusMap from '@/components/campus-map';
import Progress from '@/components/progress/progress';
import { getExploredPercent, type ClearedArea } from '@/utilities/explored';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [cleared, setCleared] = useState<ClearedArea>(null);

  const percent = useMemo(() => getExploredPercent(cleared), [cleared]);

  return (
    <View style={styles.container}>
      <CampusMap cleared={cleared} />
      <Progress percent={percent} style={[styles.progress, { top: insets.top + 8 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progress: {
    position: 'absolute',
    left: 16,
  },
});