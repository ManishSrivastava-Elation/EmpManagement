import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as yup from "yup";

import FormInput from "@/components/common/FormInput";
import PrimaryButton from "@/components/common/PrimaryButton";
import LoginFooter from "./LoginFooter";
import SearchableSelect from "@/components/common/SearchableSelect";
import { theme } from "@/theme";

const { colors, spacing, fontSize, fontWeight } = theme;

const loginSchema = yup.object({
  userType: yup
    .string()
    .nullable()
    .required("Please select a user type"),
  identifier: yup
    .string()
    .trim()
    .required("Email or mobile is required")
    .test("email-or-mobile", "Enter a valid email or 10-digit mobile number", (val) => {
      if (!val) return false;
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isMobile = /^[6-9]\d{9}$/.test(val);
      return isEmail || isMobile;
    }),
  password: yup.string().required("Password is required"),
});

type FormData = {
  userType: string | number | null;
  identifier: string;
  password: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

type Props = {
  isLoading: boolean;
  onLogin: (data: FormData) => void;
};

export default function LoginForm({ isLoading, onLogin }: Props) {
  const [userType, setUserType] = useState<string | number | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const userTypes = [
    { label: "Company", value: "company" },
    { label: "Employee", value: "employee" },
  ];

  const handleSubmit = async () => {
    const formData = { userType, identifier, password };
    try {
      await loginSchema.validate(formData, { abortEarly: false });
      setErrors({});
      onLogin(formData);
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
    <View style={styles.form}>
      <SearchableSelect
        label="User Type"
        required
        options={userTypes}
        value={userType}
        onChange={(val) => {
          setUserType(val);
          setErrors((prev) => ({ ...prev, userType: undefined }));
        }}
        placeholder="Select user type"
        leftIcon="person-outline"
        error={errors.userType}
      />

      <FormInput
        label="Email or Mobile"
        leftIcon="person-outline"
        placeholder="Enter email or mobile number"
        value={identifier}
        onChangeText={(val) => {
          setIdentifier(val);
          setErrors((prev) => ({ ...prev, identifier: undefined }));
        }}
        error={errors.identifier}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormInput
        label="Password"
        type="password"
        leftIcon="lock-closed-outline"
        placeholder="Enter your password"
        value={password}
        onChangeText={(val) => {
          setPassword(val);
          setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
      />

      <Pressable
        style={styles.forgotContainer}
        onPress={() => router.push("/forgotPassword")}
      >
        <Text style={styles.forgot}>Forgot Password?</Text>
      </Pressable>

      <PrimaryButton
        label={isLoading ? "Signing In..." : "Sign In"}
        onPress={handleSubmit}
        disabled={isLoading}
      />

      <LoginFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  forgotContainer: {
    alignSelf: "flex-end",
  },
  forgot: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
