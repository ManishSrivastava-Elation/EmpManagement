import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

import { theme } from "../../theme";

const { colors, spacing, radius, fontSize, fontWeight } = theme;

type Props = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  type?: "text" | "password" | "email" | "number";
  prefix?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

export default function FormInput({
  label,
  required,
  error,
  type = "text",
  prefix,
  leftIcon,
  disabled,
  style,
  multiline,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const keyboardType =
    type === "email"
      ? "email-address"
      : type === "number"
      ? "numeric"
      : props.keyboardType;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={colors.textSecondary}
            style={styles.icon}
          />
        )}

        {prefix && (
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </View>
        )}

        <TextInput
          {...props}
          editable={!disabled}
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            multiline && styles.multiline,
            style,
          ]}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Ionicons
              name={
                showPassword
                  ? "eye-outline"
                  : "eye-off-outline"
              }
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },

  label: {
    marginBottom: spacing.xs,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },

  required: {
    color: colors.danger,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },

  inputError: {
    borderColor: colors.danger,
  },

  disabled: {
    opacity: 0.5,
  },

  icon: {
    marginLeft: spacing.md,
  },

  prefix: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },

  prefixText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.sm,
  },

  multiline: {
    minHeight: 120,
    textAlignVertical: "top",
  },

  eyeBtn: {
    paddingHorizontal: spacing.sm,
  },

  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: fontSize.xs,
  },
});