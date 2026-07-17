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

export default function CustomerAddressSection({ formData, errors, updateField }: Props) {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name="location-outline" size={16} color={colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>Address Information</Text>
      </View>

      {/* Address Line 1 */}
      <FormInput
        label="Address Line 1"
        required
        leftIcon="home-outline"
        placeholder="e.g. Sector 10"
        value={formData.address_line1}
        onChangeText={(val) => updateField('address_line1', val)}
        error={errors.address_line1}
        autoCapitalize="words"
        returnKeyType="next"
      />

      {/* Address Line 2 */}
      <FormInput
        label="Address Line 2"
        leftIcon="map-outline"
        placeholder="e.g. Near SBI Bank (optional)"
        value={formData.address_line2}
        onChangeText={(val) => updateField('address_line2', val)}
        error={errors.address_line2}
        autoCapitalize="words"
        returnKeyType="next"
      />

      {/* City */}
      <FormInput
        label="City"
        required
        leftIcon="business-outline"
        placeholder="e.g. Lucknow"
        value={formData.city}
        onChangeText={(val) => updateField('city', val)}
        error={errors.city}
        autoCapitalize="words"
        returnKeyType="next"
      />

      {/* State */}
      <FormInput
        label="State"
        required
        leftIcon="flag-outline"
        placeholder="e.g. Uttar Pradesh"
        value={formData.state}
        onChangeText={(val) => updateField('state', val)}
        error={errors.state}
        autoCapitalize="words"
        returnKeyType="next"
      />

      {/* Pincode */}
      <FormInput
        label="Pincode"
        leftIcon="pin-outline"
        placeholder="6-digit pincode (optional)"
        value={formData.pincode}
        onChangeText={(val) => {
          const cleaned = val.replace(/[^0-9]/g, '');
          updateField('pincode', cleaned);
        }}
        error={errors.pincode}
        keyboardType="numeric"
        maxLength={6}
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
