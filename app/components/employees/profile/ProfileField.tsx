import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  badge?: React.ReactNode;
};

export default function ProfileField({ icon, label, value, badge }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || '—'}</Text>
      </View>
      {badge && <View style={styles.badgeWrap}>{badge}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}08`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.xs - 1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  badgeWrap: {
    marginLeft: spacing.xs,
  },
});
