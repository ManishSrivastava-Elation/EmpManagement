import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

export default function Footer() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom+ 6),
        },
      ]}
    >
      <Text style={styles.text}>
        Powered by <Text style={styles.brand}>Elation SoftNet</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.white,

    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },

  text: {
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.3,
    fontWeight: "500",
  },

  brand: {
    color: colors.primary,
    fontWeight: "700",
  },
});