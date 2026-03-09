// Animation presets — single source of truth for all motion decisions
import { Animated, Easing } from 'react-native';

export const Spring = {
  gentle: { tension: 120, friction: 14 },
  snappy: { tension: 200, friction: 18 },
  bouncy: { tension: 180, friction: 10 },
};

export const Duration = {
  instant: 100,
  fast: 180,
  normal: 280,
  slow: 420,
  xslow: 600,
};

export const Ease = {
  out: Easing.out(Easing.cubic),
  in: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  linear: Easing.linear,
};

// Fade + slide up entry (for cards, modals)
export function fadeSlideIn(
  anim: Animated.Value,
  delay = 0,
  duration = Duration.normal,
): Animated.CompositeAnimation {
  anim.setValue(0);
  return Animated.timing(anim, {
    toValue: 1,
    duration,
    delay,
    easing: Ease.out,
    useNativeDriver: true,
  });
}

// Staggered list entry — returns parallel animation for N items
export function staggeredEntrance(
  anims: Animated.Value[],
  staggerMs = 60,
  duration = Duration.normal,
): Animated.CompositeAnimation {
  anims.forEach(a => a.setValue(0));
  return Animated.stagger(
    staggerMs,
    anims.map(a =>
      Animated.timing(a, {
        toValue: 1,
        duration,
        easing: Ease.out,
        useNativeDriver: true,
      }),
    ),
  );
}

// Pulse loop (for glowing CTAs, live indicators)
export function pulseLoop(anim: Animated.Value): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 900, easing: Ease.inOut, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 900, easing: Ease.inOut, useNativeDriver: true }),
    ]),
  );
}

// ZK proof cascade — drives a 0→1 progress value over ~2.4 s
export function zkProofAnimation(anim: Animated.Value): Animated.CompositeAnimation {
  anim.setValue(0);
  return Animated.timing(anim, {
    toValue: 1,
    duration: 2400,
    easing: Easing.out(Easing.exp),
    useNativeDriver: false, // needs to drive width/color interpolations
  });
}

// Spring pop (for badges, checkmarks)
export function springPop(anim: Animated.Value): Animated.CompositeAnimation {
  anim.setValue(0);
  return Animated.spring(anim, {
    toValue: 1,
    ...Spring.bouncy,
    useNativeDriver: true,
  });
}

// Interpolate opacity + translateY from a single 0→1 anim value
export function entryStyle(anim: Animated.Value, offsetY = 18) {
  return {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [offsetY, 0],
        }),
      },
    ],
  };
}
