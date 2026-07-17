import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import FormInput from "@/components/common/FormInput";
import PrimaryButton from "@/components/common/PrimaryButton";
import SearchableSelect from "@/components/common/SearchableSelect";
import { theme } from "@/theme";
import { companyOptionsList } from "@/services/auth/company.service";
import { registerEmployee } from "@/services/auth/employee.service";
import Footer from "@/components/common/Footer";

const { colors, spacing, fontSize, fontWeight, radius } = theme;

// Enhanced validation schema
const registrationSchema = yup.object({
  company_id: yup.number().nullable().required("Please select your company"),
  full_name: yup
    .string()
    .trim()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .matches(/^[a-zA-Z\s]*$/, "Name should only contain letters and spaces"),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email address"),
  mobile_no: yup
    .string()
    .trim()
    .required("Mobile number is required")
    .matches(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit mobile number starting with 6-9",
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number & special character",
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords don't match"),
  termsAccepted: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions"),
});

type FormData = {
  company_id: number | null;
  full_name: string;
  email: string;
  mobile_no: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

type Errors = Partial<Record<keyof FormData, string>>;

type Props = {
  isLoading?: boolean;
  onRegister?: (
    data: Omit<FormData, "confirmPassword" | "termsAccepted">,
  ) => void;
};

export default function EmployeeRegistration({ isLoading, onRegister }: Props) {
  const [formData, setFormData] = useState<FormData>({
    company_id: null,
    full_name: "",
    email: "",
    mobile_no: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const activeLoading = isLoading ?? localLoading;

  useEffect(() => {
    companyOptionsList().then((res) => {
      if (res?.data) {
        setCompanyOptions(
          res.data.map((c: { companyId: number; companyName: string }) => ({
            label: c.companyName,
            value: c.companyId,
          })),
        );
      }
    });
  }, []);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
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

  const handleSubmit = async () => {
    const { confirmPassword, termsAccepted, ...registrationData } = formData;

    try {
      await registrationSchema.validate(formData, { abortEarly: false });
      setErrors({});

      if (onRegister) {
        onRegister(registrationData);
      } else {
        setLocalLoading(true);
        try {
          const res = await registerEmployee(registrationData as any);
          if (res?.success) {
            Alert.alert(
              "Account Created",
              "Your employee registration request was submitted successfully! You can now log in.",
              [
                {
                  text: "Go to Login",
                  onPress: () => router.replace("/login"),
                },
              ],
            );
          } else {
            // Handle field-level validation errors from API
            if (Array.isArray(res?.error) && res.error.length > 0) {
              const apiErrors: Errors = {};
              res.error.forEach((e: { field: string; message: string }) => {
                apiErrors[e.field as keyof FormData] = e.message;
              });
              setErrors(apiErrors);
            } else {
              Alert.alert("Error", res?.message || "Registration failed");
            }
          }
        } catch (e: any) {
          Alert.alert(
            "Error",
            e?.response?.data?.message || "Something went wrong",
          );
        } finally {
          setLocalLoading(false);
        }
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: Errors = {};
        err.inner.forEach((e) => {
          if (e.path) fieldErrors[e.path as keyof FormData] = e.message;
        });
        setErrors(fieldErrors);
      }
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join us and start your journey today
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.form}>
            {/* Company Selection */}
            <SearchableSelect
              label="Company"
              required
              options={companyOptions}
              value={formData.company_id}
              onChange={(val) => {
                updateField("company_id", val as number);
              }}
              placeholder="Select your company"
              leftIcon="business-outline"
              error={errors.company_id}
            />

            {/* Full Name */}
            <FormInput
              label="Full Name"
              required
              leftIcon="person-outline"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChangeText={(val) => updateField("full_name", val)}
              error={errors.full_name}
              autoCapitalize="words"
            />

            {/* Email */}
            <FormInput
              label="Email Address"
              required
              leftIcon="mail-outline"
              placeholder="Enter your email address"
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
              value={formData.mobile_no}
              onChangeText={(val) => {
                const cleaned = val.replace(/[^0-9]/g, "");
                updateField("mobile_no", cleaned);
              }}
              error={errors.mobile_no}
              keyboardType="phone-pad"
              maxLength={10}
              rightIcon={
                formData.mobile_no.length === 10 ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.success}
                  />
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
                onPress={() =>
                  updateField("termsAccepted", !formData.termsAccepted)
                }
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
                    <Text style={styles.termsError}>
                      {errors.termsAccepted}
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                label="Create Account"
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
      <Footer />
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
