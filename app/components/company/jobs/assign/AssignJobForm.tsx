import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/components/common/PrimaryButton';
import EmployeeDropdown from './EmployeeDropdown';
import { assignJob } from '@/services/company/job.service';
import { theme } from '@/theme';

const { colors } = theme;

type Props = {
  jobId: number;
  isReassign: boolean;
  onSuccess: () => void;
};

export default function AssignJobForm({ jobId, isReassign, onSuccess }: Props) {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [employeeError, setEmployeeError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!employeeId) {
      setEmployeeError('Please select an employee');
      return;
    }
    setEmployeeError('');
    setApiError('');
    setLoading(true);
    try {
      await assignJob({ job_id: jobId, employee_id: employeeId });
      onSuccess();
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Failed to assign job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <EmployeeDropdown
        value={employeeId}
        onChange={setEmployeeId}
        error={employeeError}
      />
      {!!apiError && <Text style={styles.apiError}>{apiError}</Text>}
      <PrimaryButton
        label={isReassign ? 'Reassign Job' : 'Assign Job'}
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  apiError: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
});
