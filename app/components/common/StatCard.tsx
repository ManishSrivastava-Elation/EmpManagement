// components/common/StatCard.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';

interface StatCardProps {
  label: string;
  count: number;
  color: string;
  icon: string;
  active: boolean;
  onPress: () => void;
  style?: any;
}

export default function StatCard({
  label,
  count,
  color,
  icon,
  active,
  onPress,
  style,
}: StatCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        style,
        active && {
          borderColor: color,
          borderWidth: 2,
          shadowColor: color,
          shadowOpacity: 0.15,
        },
      ]}
    >
      <View style={[styles.iconRing, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.count, { color: active ? color : theme.colors.text }]}>
        {count}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {active && <View style={[styles.activeDot, { backgroundColor: color }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  iconRing: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  count: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  label: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.2,
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
