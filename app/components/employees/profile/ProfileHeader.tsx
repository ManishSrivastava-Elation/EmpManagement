import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

type Props = {
  name: string;
  employeeCode: string;
  companyName: string;
};

export default function ProfileHeader({ name, employeeCode, companyName }: Props) {
  // Get initials of the name (e.g. "John Doe" -> "JD")
  const getInitials = (fullName: string) => {
    if (!fullName) return 'EM';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={12} color={colors.white} />
        </View>
      </View>

      <View style={styles.infoWrap}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{employeeCode}</Text>
        </View>
        <View style={styles.companyRow}>
          <Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.companyText}>{companyName}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  badge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  infoWrap: {
    alignItems: 'center',
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  codeBadge: {
    backgroundColor: `${colors.primary}08`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  codeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  companyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
