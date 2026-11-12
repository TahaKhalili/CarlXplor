import { distance } from '@turf/turf';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CampusMap from '@/components/campus-map';
import Progress from '@/components/progress/progress';
import { clearAlong, getExploredPercent, type ClearedArea } from '@/utilities/explored';
import PlusButton from '@/components/buttons';
import CrownButton from '@/components/leaderboard';
import LocationButton from '@/components/location';
import { mapStyles } from '@/components/mapStyles';
import ProfileButton from '@/components/profile';
import { startLocation, stopLocation } from '@/location';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [cleared, setCleared] = useState<ClearedArea>(null);
  const lastSpot = useRef<[number, number] | null>(null);

  const percent = useMemo(() => getExploredPercent(cleared), [cleared]);

  useEffect(() => {
    startLocation((loc) => {
      const { latitude, longitude, accuracy } = loc.coords;
      if (accuracy != null && accuracy > 15) return;

      const here: [number, number] = [longitude, latitude];
      const last = lastSpot.current;
      if (!last) {
        lastSpot.current = here;
        return;
      }

      const moved = distance(last, here, { units: 'meters' });
      if (moved < 5) return;

      lastSpot.current = here;
      if (moved > 50) return;

      setCleared((prev) => clearAlong(prev, last, here));
    });
    return () => stopLocation();
  }, []);

  return (
    <View style={styles.container}>
      <CampusMap cleared={cleared} />

      <Progress
        percent={percent}
        style={[styles.progress, { top: insets.top + 8 }]}
      />

      <View style={mapStyles.topButtons}>
        <ProfileButton />
        <LocationButton />
        <CrownButton />
      </View>

      <View style={mapStyles.bottomButton}>
        <PlusButton />
      </View>
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
