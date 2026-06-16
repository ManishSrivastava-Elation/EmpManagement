import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { theme } from "@/theme";

const { colors, spacing, fontSize, fontWeight } = theme;

export default function LoginFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Don't have an account?{" "}
      </Text>

      <Pressable onPress={() => router.replace("/registration")}>
        <Text style={styles.link}>Sign Up</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.sm,
  },

  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },

  link: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
});