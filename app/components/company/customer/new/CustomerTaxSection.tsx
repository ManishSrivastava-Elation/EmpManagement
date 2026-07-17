import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import FormInput from '@/components/common/FormInput';
import { theme } from '@/theme';
import { CustomerFormData, CustomerFormErrors } from './customerTypes';

const { colors, spacing, fontSize, fontWeight, radius } = theme;

type Props = {
  formData: CustomerFormData;
  errors: CustomerFormErrors;
  updateField: <K extends keyof CustomerFormData>(field: K, value: CustomerFormData[K]) => void;
};

export default function CustomerTaxSection({ formData, errors, updateField }: Props) {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name="receipt-outline" size={16} color={colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>Tax Information</Text>
        <Text style={styles.optionalBadge}>Optional</Text>
      </View>

      {/* GSTIN Number */}
      <FormInput
        label="GSTIN Number"
        leftIcon="document-text-outline"
        placeholder="e.g. 09ABCDE1234F1Z5"
        value={formData.gstin_number}
        onChangeText={(val) => updateField('gstin_number', val.toUpperCase())}
        error={errors.gstin_number}
        autoCapitalize="characters"
        maxLength={15}
        returnKeyType="done"
      />

      {/* GSTIN hint */}
      <View style={styles.hint}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.hintText}>
          Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: 0.2,
    flex: 1,
  },
  optionalBadge: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: -spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hintText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
