import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as yup from 'yup';

import { createJob } from '@/services/company/job.service';
import { jobSchema } from './jobSchema';
import { JobFormData, JobFormErrors, INITIAL_JOB_FORM } from './jobTypes';

export function useJobForm() {
  const [formData, setFormData] = useState<JobFormData>(INITIAL_JOB_FORM);
  const [errors, setErrors] = useState<JobFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = <K extends keyof JobFormData>(
    field: K,
    value: JobFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    try {
      // 1. Validate
      await jobSchema.validate(formData, { abortEarly: false });
      setErrors({});

      // 2. Call API
      setIsLoading(true);

      const res = await createJob({
        customer_id: formData.customer_id!,
        job_title: formData.job_title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        due_date: formData.due_date,
      });

      if (res?.success) {
        Alert.alert(
          'Job Created',
          `Job "${formData.job_title}" has been created successfully.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(company)/jobs'),
            },
          ],
        );
      } else {
        Alert.alert('Error', res?.message || 'Failed to create job. Please try again.');
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: JobFormErrors = {};
        err.inner.forEach((e) => {
          if (e.path) {
            fieldErrors[e.path as keyof JobFormData] = e.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      const apiErr = (err as any)?.response?.data;

      if (Array.isArray(apiErr?.error) && apiErr.error.length > 0) {
        const apiErrors: JobFormErrors = {};
        apiErr.error.forEach((e: { field: string; message: string }) => {
          apiErrors[e.field as keyof JobFormData] = e.message;
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

  const resetForm = () => {
    setFormData(INITIAL_JOB_FORM);
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
