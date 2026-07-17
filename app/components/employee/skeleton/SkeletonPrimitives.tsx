/**
 * Shared shimmer primitives — reused by all employee skeleton components.
 * Mirrors the exact same pattern used in components/common/SkeletonLoader.tsx.
 */
import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';

export const BONE_COLOR = '#E8ECF0';
export const SHIMMER_COLOR = 'rgba(255,255,255,0.78)';
export const CARD_BORDER = '#E5E7EB';
export const DIVIDER_COLOR = '#f1f2f4';

export function useShimmerAnim(): Animated.Value {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return anim;
}

type SBoneProps = {
  w: number | `${number}%`;
  h: number;
  r?: number;
  circle?: boolean;
  pill?: boolean;
  style?: ViewStyle;
  anim: Animated.Value;
};

export const SBone = memo(function SBone({ w, h, r = 6, circle, pill, style, anim }: SBoneProps) {
  const radius = circle ? (w as number) / 2 : pill ? 999 : r;
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-400, 400] });

  return (
    <View style={[{ width: w, height: h, borderRadius: radius, backgroundColor: BONE_COLOR, overflow: 'hidden' }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { width: '55%', backgroundColor: SHIMMER_COLOR, transform: [{ skewX: '-18deg' }, { translateX }] },
        ]}
      />
    </View>
  );
});
