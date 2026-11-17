import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

const HOLD_MS = 1200;
const FADE_MS = 400;

type Phase = 'waiting' | 'holding' | 'fading' | 'done';

// Full-screen launch image shown on app start. It hides the native splash,
// holds briefly, then fades out to reveal the map underneath.
export function LaunchScreen() {
  const [phase, setPhase] = useState<Phase>('waiting');
  // useState (not useRef) so the value is safe to use during render.
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (phase !== 'holding') return;

    const timer = setTimeout(() => {
      setPhase('fading');
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(() => setPhase('done'));
    }, HOLD_MS);

    return () => clearTimeout(timer);
  }, [phase, opacity]);

  if (phase === 'done') return null;

  function handleLayout() {
    if (phase !== 'waiting') return;
    SplashScreen.hideAsync().finally(() => setPhase('holding'));
  }

  return (
    <Animated.View
      onLayout={handleLayout}
      pointerEvents={phase === 'fading' ? 'none' : 'auto'}
      style={[styles.overlay, { opacity }]}>
      <Image
        source={require('@/assets/images/carlsxplor-launch.png')}
        contentFit="cover"
        style={styles.image}
        accessibilityLabel="CarlsXplor"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#DCE1EA',
    zIndex: 1000,
  },
  image: {
    flex: 1,
  },
});
