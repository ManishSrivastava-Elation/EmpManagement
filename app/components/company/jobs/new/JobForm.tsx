import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '@/components/common/FormInput';
import { theme } from '@/theme';
import { JobFormData, JobFormErrors } from './jobTypes';
import CustomerDropdown from './CustomerDropdown';
import PriorityDropdown from './PriorityDropdown';
import DueDatePicker from './DueDatePicker';

const { colors, spacing, fontSize, fontWeight, radius } = theme;

type Props = {
  formData: JobFormData;
  errors: JobFormErrors;
  updateField: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
};

export default function JobForm({ formData, errors, updateField }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.iconWrap}>
            <Ionicons name="briefcase-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Job Details</Text>
        </View>

        {/* Customer Select */}
        <CustomerDropdown
          value={formData.customer_id}
          onChange={(val) => updateField('customer_id', val)}
          error={errors.customer_id}
        />

        {/* Job Title */}
        <FormInput
          label="Job Title"
          required
          leftIcon="construct-outline"
          placeholder="e.g. AC Installation"
          value={formData.job_title}
          onChangeText={(val) => updateField('job_title', val)}
          error={errors.job_title}
          autoCapitalize="words"
          returnKeyType="next"
        />

        {/* Description */}
        <FormInput
          label="Description"
          leftIcon="document-text-outline"
          placeholder="Provide detail about the job..."
          value={formData.description}
          onChangeText={(val) => updateField('description', val)}
          error={errors.description}
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />

        {/* Priority Select */}
        <PriorityDropdown
          value={formData.priority}
          onChange={(val) => updateField('priority', val)}
          error={errors.priority}
        />

        {/* Due Date & Time Picker */}
        <DueDatePicker
          value={formData.due_date}
          onChange={(val) => updateField('due_date', val)}
          error={errors.due_date}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
