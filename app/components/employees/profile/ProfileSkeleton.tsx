import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { theme } from '@/theme';

const { spacing } = theme;

export default function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonLoader preset="profileCard" count={1} cardRadius={16} cardPadding={16} />
      <View style={styles.spacer} />
      <SkeletonLoader preset="generalInfo" count={1} cardRadius={16} cardPadding={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  spacer: {
    height: spacing.sm,
  },
});
