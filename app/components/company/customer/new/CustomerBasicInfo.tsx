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

export default function CustomerBasicInfo({ formData, errors, updateField }: Props) {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name="person-outline" size={16} color={colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>Basic Information</Text>
      </View>

      {/* Customer Name */}
      <FormInput
        label="Customer Name"
        required
        leftIcon="business-outline"
        placeholder="e.g. ABC Industries"
        value={formData.customer_name}
        onChangeText={(val) => updateField('customer_name', val)}
        error={errors.customer_name}
        autoCapitalize="words"
        returnKeyType="next"
      />

      {/* Phone */}
      <FormInput
        label="Phone"
        required
        leftIcon="call-outline"
        placeholder="10-digit mobile number"
        value={formData.phone}
        onChangeText={(val) => {
          const cleaned = val.replace(/[^0-9]/g, '');
          updateField('phone', cleaned);
        }}
        error={errors.phone}
        keyboardType="phone-pad"
        maxLength={10}
        rightIcon={
          formData.phone.length === 10 ? (
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          ) : undefined
        }
        returnKeyType="next"
      />

      {/* Alternate Phone */}
      <FormInput
        label="Alternate Phone"
        leftIcon="call-outline"
        placeholder="Optional alternate number"
        value={formData.alternate_phone}
        onChangeText={(val) => {
          const cleaned = val.replace(/[^0-9]/g, '');
          updateField('alternate_phone', cleaned);
        }}
        error={errors.alternate_phone}
        keyboardType="phone-pad"
        maxLength={10}
        rightIcon={
          formData.alternate_phone.length === 10 ? (
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          ) : undefined
        }
        returnKeyType="next"
      />

      {/* Email */}
      <FormInput
        label="Email Address"
        leftIcon="mail-outline"
        placeholder="e.g. abc@gmail.com"
        value={formData.email}
        onChangeText={(val) => updateField('email', val)}
        error={errors.email}
        type="email"
        autoCapitalize="none"
        returnKeyType="next"
      />
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
  },
});
