import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";

export default function SubscriptionHeader() {
  const { colors } = theme;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.white }]}>
        Subscription Plans
      </Text>
      <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.85)" }]}>
        Select the best plan to empower and manage your team operations seamlessly.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
});
