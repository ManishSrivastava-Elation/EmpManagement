import React from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';
import { CustomerFormData, CustomerFormErrors } from './customerTypes';
import CustomerBasicInfo from './CustomerBasicInfo';
import CustomerAddressSection from './CustomerAddressSection';
import CustomerTaxSection from './CustomerTaxSection';

const { spacing } = theme;

type Props = {
  formData: CustomerFormData;
  errors: CustomerFormErrors;
  updateField: <K extends keyof CustomerFormData>(field: K, value: CustomerFormData[K]) => void;
};

/**
 * CustomerForm — orchestrates all three form sections.
 * Keeps the screen thin by composing named section components,
 * each responsible for its own fields.
 */
export default function CustomerForm({ formData, errors, updateField }: Props) {
  return (
    <View style={styles.container}>
      <CustomerBasicInfo
        formData={formData}
        errors={errors}
        updateField={updateField}
      />
      <CustomerAddressSection
        formData={formData}
        errors={errors}
        updateField={updateField}
      />
      <CustomerTaxSection
        formData={formData}
        errors={errors}
        updateField={updateField}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
});
