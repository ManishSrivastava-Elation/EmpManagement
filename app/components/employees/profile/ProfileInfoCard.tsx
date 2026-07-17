import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { theme } from '@/theme';
import ProfileField from './ProfileField';
import { EmployeeProfile } from '@/services/auth/employee.service';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

type Props = {
  profile: EmployeeProfile;
};

export default function ProfileInfoCard({ profile }: Props) {
  const formatJoinedDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Personal Information</Text>
      <View style={styles.divider} />
      
      <View style={styles.fieldsContainer}>
        <ProfileField
          icon="mail-outline"
          label="Email Address"
          value={profile.email}
        />
        
        <View style={styles.rowDivider} />
        
        <ProfileField
          icon="call-outline"
          label="Phone Number"
          value={profile.phone}
        />
        
        <View style={styles.rowDivider} />
        
        <ProfileField
          icon="briefcase-outline"
          label="Designation"
          value={profile.designation || 'Technician'}
        />
        
        <View style={styles.rowDivider} />
        
        <ProfileField
          icon="calendar-outline"
          label="Joined Date"
          value={formatJoinedDate(profile.created_at)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  fieldsContainer: {
    gap: spacing.xs,
  },
  rowDivider: {
    height: 1,
    backgroundColor: `${colors.border}70`,
    marginLeft: 46, // Aligns with the end of the icon circle
  },
});
