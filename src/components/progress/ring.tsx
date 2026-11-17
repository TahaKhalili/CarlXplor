import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type RingProps = {
  size: number;
  stroke: number;
  percent: number; // 0 to 100
  color: string;
  trackColor: string;
  filled?: boolean; // solid disc instead of a ring, used for finishers
  children?: ReactNode; // shown in the middle
};

// A circle that fills clockwise from the top.
// Built from plain Views so it needs no extra library: each half of the circle
// is a window, and a half ring rotates into view behind it.
export default function Ring({ size, stroke, percent, color, trackColor, filled, children }: RingProps) {
  const half = size / 2;
  const circle = { width: size, height: size, borderRadius: half };

  if (filled) {
    return <View style={[styles.center, circle, { backgroundColor: color }]}>{children}</View>;
  }

  const clamped = Math.max(0, Math.min(100, percent));
  const degrees = (clamped / 100) * 360;
  const rightDegrees = Math.min(degrees, 180);
  const leftDegrees = Math.max(degrees - 180, 0);

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View style={[styles.layer, circle, { borderWidth: stroke, borderColor: trackColor }]} />

      {/* right window: the first 50% */}
      <View style={[styles.layer, styles.window, { left: half, width: half, height: size }]}>
        <View
          style={[
            styles.layer,
            { left: -half, width: size, height: size, transform: [{ rotate: `${rightDegrees}deg` }] },
          ]}>
          <View style={[styles.window, { width: half, height: size }]}>
            <View style={[circle, { borderWidth: stroke, borderColor: color }]} />
          </View>
        </View>
      </View>

      {/* left window: 50% to 100% */}
      <View style={[styles.layer, styles.window, { width: half, height: size }]}>
        <View
          style={[styles.layer, { width: size, height: size, transform: [{ rotate: `${leftDegrees}deg` }] }]}>
          <View style={[styles.window, { marginLeft: half, width: half, height: size }]}>
            <View style={[circle, { marginLeft: -half, borderWidth: stroke, borderColor: color }]} />
          </View>
        </View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  window: {
    overflow: 'hidden',
  },
});