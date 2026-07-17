import React from "react";
import { View, Text, StyleSheet } from "react-native";

const NoActiveSubscription = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔒</Text>
        </View>

        <Text style={styles.title}>No Active Subscription</Text>

        <Text style={styles.description}>
          Your subscription is currently inactive or has expired.
          Renew or purchase a subscription to continue accessing all features.
        </Text>
      </View>
    </View>
  );
};

export default NoActiveSubscription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 40,
    paddingHorizontal: 28,

    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 2,
  },

  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EEF2FF",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 24,
  },

  icon: {
    fontSize: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 14,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    color: "#6B7280",
  },
});