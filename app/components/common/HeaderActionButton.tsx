import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const { colors, spacing, radius, fontSize, fontWeight } = theme;

interface HeaderActionButtonProps {
  visible: boolean;
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function HeaderActionButton({
  visible,
  title,
  onPress,
  disabled = false,
}: HeaderActionButtonProps) {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.turnery, colors.success]}  
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.btn}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    marginRight: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  disabled: {
    opacity: 0.5,
  },
});