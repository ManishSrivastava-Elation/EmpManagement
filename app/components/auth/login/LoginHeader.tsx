import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/theme";

const { colors, spacing, fontSize, fontWeight } = theme;

export default function LoginHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.logoWrapper}>
        <Text style={styles.logo}>EM</Text>
      </View>

      <Text style={styles.title}>Welcome Back</Text>

      <Text style={styles.subtitle}>
        Sign in to continue managing your workforce
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    alignItems: "center",
  },

  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  logo: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },

  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
    lineHeight: 22,
  },
});