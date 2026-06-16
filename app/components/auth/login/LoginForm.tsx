import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

import FormInput from "@/components/common/FormInput";
import PrimaryButton from "@/components/common/PrimaryButton";
import LoginFooter from "./LoginFooter";
import { theme } from "@/theme";

const { colors, spacing, fontSize, fontWeight } = theme;

type Props = {
  isLoading: boolean;
  onLogin: () => void;
};

export default function LoginForm({
  isLoading,
  onLogin,
}: Props) {
  return (
    <View style={styles.form}>
      <FormInput
        label="Email"
        type="email"
        leftIcon="mail-outline"
        placeholder="Enter your email"
      />

      <FormInput
        label="Password"
        type="password"
        leftIcon="lock-closed-outline"
        placeholder="Enter your password"
      />

      <Pressable
        style={styles.forgotContainer}
        onPress={() => router.push("/forgotPassword")}
      >
        <Text style={styles.forgot}>
          Forgot Password?
        </Text>
      </Pressable>

      <PrimaryButton
        label={
          isLoading
            ? "Signing In..."
            : "Sign In"
        }
        onPress={onLogin}
        disabled={isLoading}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />

        <Text style={styles.dividerText}>
          or
        </Text>

        <View style={styles.dividerLine} />
      </View>

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

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginVertical: spacing.xs,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor:
      colors.border || "#E5E7EB",
  },

  dividerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});