import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const REVEAL_MS = 350; // map + wordmark fade in
const HOLD_MS = 900; // everything visible
const FADE_OUT_MS = 400; // whole overlay fades away

const LOGO_SIZE = 200; // same as imageWidth in app.json (native splash)
const WORDMARK_WIDTH = 260;
const WORDMARK_HEIGHT = (WORDMARK_WIDTH * 384) / 1719;
const WORDMARK_GAP = 16;

type Phase = 'waiting' | 'revealing' | 'fading' | 'done';

// Launch screen that starts as an exact copy of the native splash (logo
// centered on gray), then fades in the map and wordmark, holds, and fades
// out to reveal the real map underneath.
export function LaunchScreen() {
  const [phase, setPhase] = useState<Phase>('waiting');
  // useState (not useRef) so these values are safe to use during render.
  const [reveal] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (phase === 'revealing') {
      Animated.timing(reveal, {
        toValue: 1,
        duration: REVEAL_MS,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => setPhase('fading'), REVEAL_MS + HOLD_MS);
      return () => clearTimeout(timer);
    }

    if (phase === 'fading') {
      const fadeOut = Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      });
      fadeOut.start(() => setPhase('done'));
      return () => fadeOut.stop();
    }
  }, [phase, reveal, opacity]);

  if (phase === 'done') return null;

  // Hide the native splash only once our identical logo is on screen,
  // so there is no blank frame in between.
  function handleLogoReady() {
    if (phase !== 'waiting') return;
    SplashScreen.hideAsync().finally(() => setPhase('revealing'));
  }

  return (
    <Animated.View
      pointerEvents={phase === 'fading' ? 'none' : 'auto'}
      accessible
      accessibilityLabel="CarlsXplor"
      style={[styles.overlay, { opacity }]}>
      <Animated.View style={[styles.fill, { opacity: reveal }]}>
        <Image
          source={require('@/assets/images/carlsxplor-launch-map.png')}
          contentFit="cover"
          style={styles.fill}
        />
      </Animated.View>

      <View style={styles.center}>
        <View style={styles.logoBox}>
          <Image
            source={require('@/assets/images/carlsxplor-splash-logo.png')}
            contentFit="contain"
            style={styles.logo}
            onLoad={handleLogoReady}
            onError={handleLogoReady}
          />
          <Animated.View style={[styles.wordmarkBox, { opacity: reveal }]}>
            <Image
              source={require('@/assets/images/carlsxplor-wordmark.png')}
              contentFit="contain"
              style={styles.wordmark}
            />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#DCE1EA',
    zIndex: 1000,
  },
  fill: {
    ...StyleSheet.absoluteFill,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  // Positioned relative to the logo box so the logo stays exactly centered.
  wordmarkBox: {
    position: 'absolute',
    top: LOGO_SIZE + WORDMARK_GAP,
    left: (LOGO_SIZE - WORDMARK_WIDTH) / 2,
    width: WORDMARK_WIDTH,
    height: WORDMARK_HEIGHT,
  },
  wordmark: {
    width: WORDMARK_WIDTH,
    height: WORDMARK_HEIGHT,
  },
});
