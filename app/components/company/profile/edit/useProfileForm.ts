import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as yup from 'yup';
import { updateCompanyProfile, type CompanyProfile } from '@/services/company/company.service';
import { companyProfileSchema } from './profileSchema';
import { CompanyProfileFormData, CompanyProfileFormErrors } from './profileTypes';

export function useCompanyProfileForm(initialProfile: CompanyProfile) {
  const [formData, setFormData] = useState<CompanyProfileFormData>({
    company_name: initialProfile.company_name || '',
    contact_person_name: initialProfile.contact_person_name || '',
    designation: initialProfile.designation || '',
    email: initialProfile.email || '',
    mobile: initialProfile.mobile || '',
  });
  
  const [errors, setErrors] = useState<CompanyProfileFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = <K extends keyof CompanyProfileFormData>(
    field: K,
    value: CompanyProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    try {
      await companyProfileSchema.validate(formData, { abortEarly: false });
      setErrors({});

      setIsLoading(true);

      const res = await updateCompanyProfile(initialProfile.company_id, {
        company_name: formData.company_name.trim(),
        contact_person_name: formData.contact_person_name.trim(),
        designation: formData.designation.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
      });

      if (res?.success) {
        Alert.alert(
          'Profile Updated',
          'Company profile has been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', res?.message || 'Failed to update profile.');
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: CompanyProfileFormErrors = {};
        err.inner.forEach((e) => {
          if (e.path) {
            fieldErrors[e.path as keyof CompanyProfileFormData] = e.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      const apiErr = (err as any)?.response?.data;
      Alert.alert(
        'Error',
        apiErr?.message || 'Something went wrong. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    updateField,
    handleSubmit,
  };
}
