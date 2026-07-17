import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '@/components/common/FormInput';
import { theme } from '@/theme';
import { ProfileFormData, ProfileFormErrors } from './profileTypes';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

type Props = {
  formData: ProfileFormData;
  errors: ProfileFormErrors;
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void;
  profileImage?: string | null;
};

export default function ProfileForm({ formData, errors, updateField, profileImage }: Props) {
  return (
    <View style={styles.container}>
      {/* Avatar & Basic Info Header Card */}
      <View style={[styles.card, styles.headerCard]}>
        <View style={styles.avatar}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={40} color={colors.white} />
          )}
        </View>
        <Text style={styles.headerName}>{formData.name || 'Employee'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{formData.employee_code || '—'}</Text>
        </View>
      </View>

      {/* Editable Contact Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="person-outline" size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>Contact Details</Text>
        </View>

        <FormInput
          label="Full Name"
          required
          leftIcon="person-outline"
          placeholder="Enter your name"
          value={formData.name}
          onChangeText={(val) => updateField('name', val)}
          error={errors.name}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <FormInput
          label="Email Address"
          required
          leftIcon="mail-outline"
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(val) => updateField('email', val)}
          error={errors.email}
          type="email"
          autoCapitalize="none"
          returnKeyType="next"
        />

        <FormInput
          label="Phone Number"
          required
          leftIcon="call-outline"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChangeText={(val) => updateField('phone', val.replace(/[^0-9]/g, ''))}
          error={errors.phone}
          keyboardType="numeric"
          maxLength={10}
          returnKeyType="done"
        />
      </View>

      {/* Workplace Details (Read Only) */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="business-outline" size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>Workplace Info</Text>
        </View>

        <View style={styles.readOnlyRow}>
          <Ionicons name="card-outline" size={20} color={colors.textSecondary} style={styles.readOnlyIcon} />
          <View style={styles.readOnlyTextWrap}>
            <Text style={styles.readOnlyLabel}>Employee Code</Text>
            <Text style={styles.readOnlyValue}>{formData.employee_code || '—'}</Text>
          </View>
        </View>

        <View style={[styles.readOnlyRow, { borderBottomWidth: 0 }]}>
          <Ionicons name="business-outline" size={20} color={colors.textSecondary} style={styles.readOnlyIcon} />
          <View style={styles.readOnlyTextWrap}>
            <Text style={styles.readOnlyLabel}>Company</Text>
            <Text style={styles.readOnlyValue}>{formData.company_name || '—'}</Text>
          </View>
        </View>

        <View style={styles.noticeContainer}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.noticeText}>
            Workplace details are managed by your administrator and cannot be modified directly.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  headerName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    backgroundColor: '#EEF2FB',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.primary,
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.semibold,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.md - 1,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  readOnlyIcon: {
    marginRight: spacing.sm,
  },
  readOnlyTextWrap: {
    flex: 1,
  },
  readOnlyLabel: {
    fontSize: fontSize.xs - 1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  readOnlyValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: {
    flex: 1,
    fontSize: fontSize.xs - 1,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

