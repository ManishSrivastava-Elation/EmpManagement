// app/(employee)/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getGreeting } from "../../../utils/timeHelpers";

const Header = ({ greeting }: { greeting: string }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar} />
          </View>
          <View style={styles.onlineDot} />
        </View>
        <View>
          <Text style={styles.greetingSmall}>{greeting} ✨</Text>
          <Text style={styles.greeting}>
            Hi, <Text style={styles.greetingBold}>User</Text>
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.menuBtn}
        onPress={() => setMenuVisible(!menuVisible)}
      >
        <Ionicons name="chevron-down-outline" size={20} color="#374151" />
      </Pressable>
    </View>
  );
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#f8f9fa", "#f1f3f5", "#e9ecef"]}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Header greeting={greeting} />

        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={["#1b2e6f", "#1e40af"]}
            style={styles.cardGradient}
          >
            <Ionicons name="sparkles" size={32} color="#fcd34d" style={styles.sparkleIcon} />
            <Text style={styles.welcomeTitle}>Welcome to your Dashboard</Text>
            <Text style={styles.welcomeSubtitle}>
              Manage your assigned jobs, track your attendance, and report expenses all in one place.
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.actionCard}>
          <View style={styles.actionIconBox}>
            <Ionicons name="briefcase" size={24} color="#1b2e6f" />
          </View>
          <View style={styles.actionTextInfo}>
            <Text style={styles.actionTitle}>Ready to Start Work?</Text>
            <Text style={styles.actionDesc}>
              Head over to the <Text style={styles.boldText}>Job</Text> tab, select your assigned task, and check-in to begin your shift.
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </LinearGradient>
  );
}

// Styles
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6b7280",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#9ca3af",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#f8f9fa",
  },
  greetingSmall: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 2,
    fontWeight: "500",
  },
  greeting: {
    color: "#6b7280",
    fontSize: 20,
    fontWeight: "400",
  },
  greetingBold: {
    color: "#111827",
    fontWeight: "800",
  },
  menuBtn: {
    width: 42,
    height: 42,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  welcomeCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 24,
  },
  sparkleIcon: {
    marginBottom: 12,
  },
  welcomeTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 20,
  },
  actionCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "700",
    color: "#1b2e6f",
  },
});
