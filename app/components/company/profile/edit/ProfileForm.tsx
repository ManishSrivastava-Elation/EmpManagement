import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '@/components/common/FormInput';
import { theme } from '@/theme';
import { CompanyProfileFormData, CompanyProfileFormErrors } from './profileTypes';
import { baseImageUrl } from '@/api/apis';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

type Props = {
  formData: CompanyProfileFormData;
  errors: CompanyProfileFormErrors;
  updateField: <K extends keyof CompanyProfileFormData>(field: K, value: CompanyProfileFormData[K]) => void;
  logoUrl?: string | null;
  companyId?: string | number;
};

export default function ProfileForm({ formData, errors, updateField, logoUrl, companyId }: Props) {
  const fullLogoUrl = logoUrl ? `${baseImageUrl}${logoUrl}` : null;

  return (
    <View style={styles.container}>
      {/* Logo & Basic Info Header Card */}
      <View style={[styles.card, styles.headerCard]}>
        <View style={styles.avatar}>
          {fullLogoUrl ? (
            <Image source={{ uri: fullLogoUrl }} style={styles.avatarImage} resizeMode="contain" />
          ) : (
            <Ionicons name="business" size={40} color={colors.white} />
          )}
        </View>
        <Text style={styles.headerName}>{formData.company_name || 'Company'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ID: {companyId || '—'}</Text>
        </View>
      </View>

      {/* Editable Company & Contact Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="business-outline" size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>Company Details</Text>
        </View>

        <FormInput
          label="Company Name"
          required
          leftIcon="business-outline"
          placeholder="Enter company name"
          value={formData.company_name}
          onChangeText={(val) => updateField('company_name', val)}
          error={errors.company_name}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <FormInput
          label="Contact Person Name"
          required
          leftIcon="person-outline"
          placeholder="Enter contact person name"
          value={formData.contact_person_name}
          onChangeText={(val) => updateField('contact_person_name', val)}
          error={errors.contact_person_name}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <FormInput
          label="Designation"
          required
          leftIcon="ribbon-outline"
          placeholder="Enter designation"
          value={formData.designation}
          onChangeText={(val) => updateField('designation', val)}
          error={errors.designation}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      {/* Contact Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="call-outline" size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>Contact Info</Text>
        </View>

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
          label="Mobile Number"
          required
          leftIcon="call-outline"
          placeholder="Enter mobile number"
          value={formData.mobile}
          onChangeText={(val) => updateField('mobile', val.replace(/[^0-9]/g, ''))}
          error={errors.mobile}
          keyboardType="numeric"
          maxLength={10}
          returnKeyType="done"
        />
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarImage: {
    width: '70%',
    height: '70%',
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
});
