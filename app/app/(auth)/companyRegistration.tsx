import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import * as yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

import FormInput from "@/components/common/FormInput";
import PrimaryButton from "@/components/common/PrimaryButton";
import { theme } from "@/theme";
import { registerCompany } from "@/services/auth/company.service";

const { colors, spacing, fontSize, fontWeight, radius } = theme;

// Validation schema for company registration (without status)
const companyRegistrationSchema = yup.object({
  company_name: yup
    .string()
    .trim()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be at most 100 characters"),
  contact_person_name: yup
    .string()
    .trim()
    .required("Contact person name is required")
    .min(2, "Contact person name must be at least 2 characters")
    .max(50, "Contact person name must be at most 50 characters")
    .matches(/^[a-zA-Z\s]*$/, "Name should only contain letters and spaces"),
  designation: yup
    .string()
    .trim()
    .required("Designation is required")
    .min(2, "Designation must be at least 2 characters")
    .max(50, "Designation must be at most 50 characters"),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email address"),
  mobile: yup
    .string()
    .trim()
    .required("Mobile number is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number starting with 6-9"),
  company_logo: yup
    .mixed()
    .nullable()
    .notRequired(),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number & special character"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref('password')], "Passwords don't match"),
  termsAccepted: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions"),
});

type LogoFile = { uri: string; name: string; type: string };

type CompanyFormData = {
  company_name: string;
  contact_person_name: string;
  designation: string;
  email: string;
  mobile: string;
  company_logo: LogoFile | null;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

type Errors = Partial<Record<keyof CompanyFormData, string>>;

type Props = {
  isLoading?: boolean;
  onRegister?: (data: Omit<CompanyFormData, 'confirmPassword' | 'termsAccepted'>) => void;
};

export default function CompanyRegistration({ isLoading, onRegister }: Props) {
  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: "",
    contact_person_name: "",
    designation: "",
    email: "",
    mobile: "",
    company_logo: null,
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  
  const [errors, setErrors] = useState<Errors>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const activeLoading = isLoading ?? localLoading;

  const updateField = <K extends keyof CompanyFormData>(
    field: K,
    value: CompanyFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
    return strength;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return colors.danger;
    if (passwordStrength === 3) return colors.warning;
    if (passwordStrength >= 4) return colors.success;
    return colors.textSecondary;
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength === 3) return "Medium";
    if (passwordStrength >= 4) return "Strong";
    return "";
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload a logo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.uri.split("/").pop() ?? "logo.jpg";
        const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
        const mimeType = ext === "png" ? "image/png" : ext === "jpeg" || ext === "jpg" ? "image/jpeg" : "image/*";
        updateField("company_logo", { uri: asset.uri, name: fileName, type: mimeType });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    const { confirmPassword, termsAccepted, company_logo, ...registrationData } = formData;

    try {
      await companyRegistrationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setLocalLoading(true);

      const res = await registerCompany({
        ...registrationData,
        logo: company_logo,
      });

      if (res.success) {
        Alert.alert(
          "Company Registered",
          "Your company has been registered successfully! You can now log in.",
          [{ text: "Go to Login", onPress: () => router.replace("/login") }]
        );
      } else if (res.statusCode === 409) {
        Alert.alert("Already Exists", res.message ?? "Company already registered.");
      } else {
        const messages = Array.isArray(res.error)
          ? res.error.map((e: { message: string }) => e.message).join("\n")
          : res.message ?? "Registration failed.";
        Alert.alert("Error", messages);
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: Errors = {};
        err.inner.forEach((e) => {
          if (e.path) fieldErrors[e.path as keyof CompanyFormData] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBg}
        >
          <View style={styles.headerHeader}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={15}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </Pressable>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Company Registration</Text>
            <Text style={styles.subtitle}>
              Register your company and start hiring
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.form}>
            {/* Company Logo Upload */}
            <View style={styles.logoContainer}>
              <Text style={styles.label}>
                Company Logo
              </Text>
              <TouchableOpacity
                style={styles.logoUploadBox}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                {formData.company_logo ? (
                  <Image
                    source={{ uri: formData.company_logo.uri }}
                    style={styles.logoPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={40} color={colors.primary} />
                    <Text style={styles.logoPlaceholderText}>Tap to upload logo</Text>
                    <Text style={styles.logoPlaceholderSubtext}>PNG, JPG, JPEG (Max 2MB)</Text>
                  </View>
                )}
              </TouchableOpacity>
              {formData.company_logo && (
                <Pressable
                  style={styles.removeLogoButton}
                  onPress={() => updateField("company_logo", null)}
                >
                  <Text style={styles.removeLogoText}>Remove Logo</Text>
                </Pressable>
              )}
            </View>

            {/* Company Name */}
            <FormInput
              label="Company Name"
              required
              leftIcon="business-outline"
              placeholder="Enter company name"
              value={formData.company_name}
              onChangeText={(val) => updateField("company_name", val)}
              error={errors.company_name}
              autoCapitalize="words"
            />

            {/* Contact Person Name */}
            <FormInput
              label="Contact Person Name"
              required
              leftIcon="person-outline"
              placeholder="Enter contact person name"
              value={formData.contact_person_name}
              onChangeText={(val) => updateField("contact_person_name", val)}
              error={errors.contact_person_name}
              autoCapitalize="words"
            />

            {/* Designation */}
            <FormInput
              label="Designation"
              required
              leftIcon="briefcase-outline"
              placeholder="Enter designation (e.g., HR Manager)"
              value={formData.designation}
              onChangeText={(val) => updateField("designation", val)}
              error={errors.designation}
              autoCapitalize="words"
            />

            {/* Email */}
            <FormInput
              label="Email Address"
              required
              leftIcon="mail-outline"
              placeholder="Enter company email"
              value={formData.email}
              onChangeText={(val) => updateField("email", val)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Mobile Number */}
            <FormInput
              label="Mobile Number"
              required
              leftIcon="call-outline"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobile}
              onChangeText={(val) => {
                const cleaned = val.replace(/[^0-9]/g, '');
                updateField("mobile", cleaned);
              }}
              error={errors.mobile}
              keyboardType="phone-pad"
              maxLength={10}
              rightIcon={
                formData.mobile.length === 10 ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                ) : undefined
              }
            />

            {/* Password */}
            <View>
              <FormInput
                label="Password"
                type="password"
                required
                leftIcon="lock-closed-outline"
                placeholder="Create a strong password"
                value={formData.password}
                onChangeText={(val) => {
                  updateField("password", val);
                  calculatePasswordStrength(val);
                }}
                error={errors.password}
              />
              
              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <Text
                    style={[
                      styles.strengthText,
                      { color: getPasswordStrengthColor() },
                    ]}
                  >
                    Password Strength: {getPasswordStrengthText()}
                  </Text>
                  <View style={styles.strengthSegments}>
                    {[1, 2, 3, 4, 5].map((index) => {
                      const isActive = index <= passwordStrength;
                      return (
                        <View
                          key={index}
                          style={[
                            styles.strengthSegment,
                            isActive && {
                              backgroundColor: getPasswordStrengthColor(),
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <FormInput
              label="Confirm Password"
              type="password"
              required
              leftIcon="lock-closed-outline"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(val) => updateField("confirmPassword", val)}
              error={errors.confirmPassword}
            />

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Pressable
                style={styles.checkboxContainer}
                onPress={() => updateField("termsAccepted", !formData.termsAccepted)}
              >
                <View
                  style={[
                    styles.checkbox,
                    formData.termsAccepted && styles.checkboxChecked,
                    errors.termsAccepted && styles.checkboxError,
                  ]}
                >
                  {formData.termsAccepted && (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  )}
                </View>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    I agree to the{" "}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                  {errors.termsAccepted && (
                    <Text style={styles.termsError}>{errors.termsAccepted}</Text>
                  )}
                </View>
              </Pressable>
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                label="Register Company"
                onPress={handleSubmit}
                loading={activeLoading}
                disabled={activeLoading}
              />
            </View>

            {/* Sign In Link */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.push("/login")}>
                <Text style={styles.footerLink}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBg: {
    paddingTop: Platform.OS === "ios" ? 50 : 35,
    paddingBottom: 60,
    paddingHorizontal: spacing.lg,
  },
  headerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  headerContent: {
    marginTop: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    marginTop: -30,
    marginHorizontal: spacing.md,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
    alignSelf: "flex-start",
  },
  required: {
    color: colors.danger,
  },
  logoUploadBox: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginVertical: spacing.xs,
  },
  logoPreview: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    alignItems: "center",
    padding: spacing.sm,
  },
  logoPlaceholderText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logoPlaceholderSubtext: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    opacity: 0.7,
  },
  removeLogoButton: {
    marginTop: spacing.xs,
  },
  removeLogoText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  passwordStrengthContainer: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  strengthText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  strengthSegments: {
    flexDirection: "row",
    gap: 6,
    height: 4,
    marginTop: 2,
  },
  strengthSegment: {
    flex: 1,
    height: "100%",
    backgroundColor: colors.border,
    borderRadius: radius.full,
  },
  termsContainer: {
    marginTop: spacing.xs,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.danger,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  termsError: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  footerText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});