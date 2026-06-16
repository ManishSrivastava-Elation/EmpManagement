import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { theme } from "../../theme";

const { colors, spacing, radius, fontSize, fontWeight } = theme;

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
  buttonStyle,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        buttonStyle,
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.success]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.text}>
            {label}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },

  disabled: {
    opacity: 0.5,
  },

  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },

  text: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});