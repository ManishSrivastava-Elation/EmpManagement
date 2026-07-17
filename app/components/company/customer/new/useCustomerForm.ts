import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as yup from 'yup';

import { createCustomer } from '@/services/company/customer.service';
import { customerSchema } from './customerSchema';
import {
  CustomerFormData,
  CustomerFormErrors,
  INITIAL_CUSTOMER_FORM,
} from './customerTypes';

export function useCustomerForm() {
  const [formData, setFormData] = useState<CustomerFormData>(INITIAL_CUSTOMER_FORM);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // ── Field updater — clears the error for that field on change ─────────────
  const updateField = <K extends keyof CustomerFormData>(
    field: K,
    value: CustomerFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      // 1. Validate — abortEarly:false collects ALL errors at once
      await customerSchema.validate(formData, { abortEarly: false });
      setErrors({});

      // 2. Call API
      setIsLoading(true);
      const res = await createCustomer({
        customer_name: formData.customer_name.trim(),
        phone: formData.phone.trim(),
        address_line1: formData.address_line1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        alternate_phone: formData.alternate_phone,
        email: formData.email,
        address_line2: formData.address_line2,
        pincode: formData.pincode,
        gstin_number: formData.gstin_number,
      });

      if (res?.success) {
        Alert.alert(
          'Customer Created',
          `${formData.customer_name} has been added successfully.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(company)/customers'),
            },
          ],
        );
      } else {
        Alert.alert('Error', res?.message || 'Failed to create customer. Please try again.');
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Collect all field-level errors
        const fieldErrors: CustomerFormErrors = {};
        err.inner.forEach((e) => {
          if (e.path) {
            fieldErrors[e.path as keyof CustomerFormData] = e.message;
          }
        });
        setErrors(fieldErrors);
        console.log('❌ Validation Errors:', fieldErrors);
        return;
      }

      // Network / API errors
      const apiErr = (err as any)?.response?.data;

      // Handle field-level errors returned from the API (e.g. duplicate phone)
      if (Array.isArray(apiErr?.error) && apiErr.error.length > 0) {
        const apiErrors: CustomerFormErrors = {};
        apiErr.error.forEach((e: { field: string; message: string }) => {
          apiErrors[e.field as keyof CustomerFormData] = e.message;
        });
        setErrors(apiErrors);
        return;
      }

      Alert.alert(
        'Error',
        apiErr?.message || 'Something went wrong. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData(INITIAL_CUSTOMER_FORM);
    setErrors({});
  };

  return {
    formData,
    errors,
    isLoading,
    updateField,
    handleSubmit,
    resetForm,
  };
}
