import React from "react";
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";

interface PurchaseButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
  isRecommended: boolean;
  accentColor: string;
}

export default function PurchaseButton({
  onPress,
  loading,
  disabled,
  isRecommended,
  accentColor,
}: PurchaseButtonProps) {
  const { colors } = theme;
  const isBtnDisabled = disabled || loading;

  const btnStyle = isRecommended
    ? { backgroundColor: accentColor }
    : {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: accentColor,
      };

  const textStyle = {
    color: isRecommended ? colors.white : accentColor,
  };

  return (
    <TouchableOpacity
      style={[styles.button, btnStyle, isBtnDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isBtnDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isRecommended ? colors.white : accentColor} size="small" />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.text, textStyle]}>Purchase Now</Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={isRecommended ? colors.white : accentColor}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    minHeight: 48,
  },
  disabled: {
    opacity: 0.65,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
  },
});
