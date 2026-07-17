import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as yup from 'yup';

import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { updatePassword } from '@/services/auth/employee.service';
import { theme } from '@/theme';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

const passwordSchema = yup.object({
  current_password: yup.string().required('Current password is required'),
  new_password: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(PASSWORD_REGEX, 'Password must contain uppercase, lowercase, number and special character'),
  confirm_password: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('new_password')], 'New password and confirm password do not match'),
});

export default function UpdatePasswordScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'Update Password',
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    try {
      await passwordSchema.validate(formData, { abortEarly: false });
      setErrors({});

      setIsLoading(true);

      const res = await updatePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      if (res?.success) {
        Alert.alert(
          'Success',
          'Password updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', res?.message || 'Failed to update password.');
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) {
            fieldErrors[e.path] = e.message;
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

  // Password requirements helper states
  const newPassword = formData.new_password;
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[@$!%*?&]/.test(newPassword);
  const passwordsMatch = newPassword === formData.confirm_password && formData.confirm_password.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Lock Icon & Instruction Header */}
          <View style={styles.headerContainer}>
            <View style={styles.lockIconContainer}>
              <Ionicons name="lock-closed" size={32} color={colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Update Password</Text>
            <Text style={styles.headerSubtitle}>
              Ensure your account is secure by setting a strong password containing letters, numbers, and symbols.
            </Text>
          </View>

          <View style={styles.formCard}>
            {/* Current Password */}
            <FormInput
              label="Current Password"
              required
              type="password"
              leftIcon="lock-closed-outline"
              placeholder="Enter current password"
              value={formData.current_password}
              onChangeText={(val) => updateField('current_password', val)}
              error={errors.current_password}
              returnKeyType="next"
            />

            {/* New Password */}
            <FormInput
              label="New Password"
              required
              type="password"
              leftIcon="lock-open-outline"
              placeholder="Enter new password"
              value={formData.new_password}
              onChangeText={(val) => updateField('new_password', val)}
              error={errors.new_password}
              returnKeyType="next"
            />

            {/* Password Requirements Checklist */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements</Text>
              <View style={styles.requirementsGrid}>
                <View style={styles.requirementCol}>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={hasMinLength ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={hasMinLength ? colors.success : colors.gray}
                    />
                    <Text style={[styles.requirementText, hasMinLength && styles.requirementTextMet]}>
                      Min. 8 characters
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={hasUppercase ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={hasUppercase ? colors.success : colors.gray}
                    />
                    <Text style={[styles.requirementText, hasUppercase && styles.requirementTextMet]}>
                      Uppercase (A-Z)
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={hasLowercase ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={hasLowercase ? colors.success : colors.gray}
                    />
                    <Text style={[styles.requirementText, hasLowercase && styles.requirementTextMet]}>
                      Lowercase (a-z)
                    </Text>
                  </View>
                </View>

                <View style={styles.requirementCol}>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={hasNumber ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={hasNumber ? colors.success : colors.gray}
                    />
                    <Text style={[styles.requirementText, hasNumber && styles.requirementTextMet]}>
                      One number (0-9)
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={hasSpecial ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={hasSpecial ? colors.success : colors.gray}
                    />
                    <Text style={[styles.requirementText, hasSpecial && styles.requirementTextMet]}>
                      Special char (@$!%*?&)
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Confirm Password */}
            <FormInput
              label="Confirm Password"
              required
              type="password"
              leftIcon="shield-checkmark-outline"
              placeholder="Confirm new password"
              value={formData.confirm_password}
              onChangeText={(val) => updateField('confirm_password', val)}
              error={errors.confirm_password}
              returnKeyType="done"
            />

            {/* Match Status indicator */}
            {formData.new_password && formData.confirm_password ? (
              <View style={styles.matchIndicatorRow}>
                <Ionicons
                  name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={passwordsMatch ? colors.success : colors.danger}
                />
                <Text style={[styles.matchText, { color: passwordsMatch ? colors.success : colors.danger }]}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Update Password"
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
  headerContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  lockIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: fontSize.sm - 1,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  requirementsContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementsTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  requirementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  requirementCol: {
    flex: 1,
    gap: 6,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requirementText: {
    fontSize: fontSize.xs - 1,
    color: colors.textSecondary,
  },
  requirementTextMet: {
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  matchIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  matchText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  backBtn: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
