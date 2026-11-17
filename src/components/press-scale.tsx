import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  useAnimatedValue,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

// Pressable that can be animated. The style goes straight on it, so
// absolutely positioned buttons stay exactly where they were.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

// A drop-in replacement for Pressable that shrinks a little while pressed.
// With Reduce Motion on, it fades instead of shrinking.
export function PressScale({ style, disabled, onPressIn, onPressOut, ...rest }: PressScaleProps) {
  const scale = useAnimatedValue(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  function scaleTo(toValue: number, duration: number) {
    Animated.timing(scale, {
      toValue,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }

  function handlePressIn(event: GestureResponderEvent) {
    if (!disabled) {
      setPressed(true);
      if (!reduceMotion) scaleTo(0.95, 100);
    }
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    setPressed(false);
    if (!reduceMotion) scaleTo(1, 160);
    onPressOut?.(event);
  }

  const feedback = reduceMotion
    ? { opacity: pressed && !disabled ? 0.6 : 1 }
    : { transform: [{ scale }] };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, feedback]}
    />
  );
}
