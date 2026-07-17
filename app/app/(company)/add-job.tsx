import { useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '@/components/common/PrimaryButton';
import { JobForm, useJobForm } from '@/components/company/jobs/new';
import { theme } from '@/theme';

const { colors, spacing } = theme;

/**
 * Add Job Screen — /(company)/add-job
 *
 * Responsibilities:
 *  - Provide the keyboard-aware scrollable layout shell
 *  - Delegate all form state and submit logic to useJobForm
 *  - Render JobForm (sections) and the sticky submit button
 *  - No inline business logic — everything is in the hook
 */
export default function AddJobScreen() {
  const navigation = useNavigation();
  const { formData, errors, isLoading, updateField, handleSubmit } = useJobForm();

  useEffect(() => {
    navigation.setOptions({ title: 'Add Job' });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Scrollable form body */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <JobForm
            formData={formData}
            errors={errors}
            updateField={updateField}
          />

          {/* Bottom padding so content clears the sticky button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Sticky submit button */}
        <View style={styles.footer}>
          <PrimaryButton
            label="Create Job"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
