import { useNavigation, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import PrimaryButton from '@/components/common/PrimaryButton';
import { ProfileForm, useCompanyProfileForm } from '@/components/company/profile/edit';
import { theme } from '@/theme';

const { colors, spacing } = theme;

export default function EditCompanyProfile() {
  const navigation = useNavigation();
  const { profile } = useLocalSearchParams<{ profile: string }>();
  
  let initialProfile = null;
  try {
    initialProfile = profile ? JSON.parse(profile) : null;
  } catch (e) {
    console.error('Failed to parse initial profile data', e);
  }

  const { formData, errors, isLoading, updateField, handleSubmit } = useCompanyProfileForm(initialProfile);

  useEffect(() => {
    navigation.setOptions({
      title: 'Edit Profile',
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (!initialProfile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No profile details found. Please try again.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <ProfileForm
            formData={formData}
            errors={errors}
            updateField={updateField}
            logoUrl={initialProfile?.logo_url}
            companyId={initialProfile?.company_id}
          />
          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Save Changes"
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
});
