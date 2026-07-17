import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as yup from 'yup';
import { updateEmployeeProfile, EmployeeProfile } from '@/services/auth/employee.service';
import { profileSchema } from './profileSchema';
import { ProfileFormData, ProfileFormErrors } from './profileTypes';

export function useProfileForm(initialProfile: EmployeeProfile) {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialProfile.name || '',
    email: initialProfile.email || '',
    phone: initialProfile.phone || '',
    employee_code: initialProfile.employee_code || '',
    company_name: initialProfile.company_name || '',
  });
  
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    try {
      await profileSchema.validate(formData, { abortEarly: false });
      setErrors({});

      setIsLoading(true);

      const res = await updateEmployeeProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      if (res?.success) {
        Alert.alert(
          'Profile Updated',
          'Your profile has been updated successfully.',
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
        const fieldErrors: ProfileFormErrors = {};
        err.inner.forEach((e) => {
          if (e.path) {
            fieldErrors[e.path as keyof ProfileFormData] = e.message;
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
