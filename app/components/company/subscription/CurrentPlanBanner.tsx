import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { type CompanySubscription } from "@/services/company/subscription.service";

interface CurrentPlanBannerProps {
  subscription: CompanySubscription | null;
}

export default function CurrentPlanBanner({ subscription }: CurrentPlanBannerProps) {
  const { colors } = theme;

  if (!subscription) {
    return (
      <View style={[styles.bannerCard, { backgroundColor: "#FFF5F5", borderColor: "#FEB2B2" }]}>
        <View style={[styles.bannerIconCircle, { backgroundColor: "#FED7D7" }]}>
          <Ionicons name="alert-circle" size={24} color="#DC2626" />
        </View>
        <View style={styles.bannerTextWrap}>
          <Text style={[styles.bannerTitle, { color: "#9B2C2C" }]}>No Active Plan</Text>
          <Text style={[styles.bannerSubtitle, { color: "#E53E3E" }]}>
            Your company does not have an active subscription. Choose a plan below to get started.
          </Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <View style={[styles.bannerCard, { backgroundColor: "#EEF2FB", borderColor: "#D7E2FB" }]}>
      <View style={[styles.bannerIconCircle, { backgroundColor: "#D7E2FB" }]}>
        <Ionicons name="diamond" size={24} color={colors.primary} />
      </View>
      <View style={styles.bannerTextWrap}>
        <View style={styles.headerRow}>
          <Text style={[styles.bannerTitle, { color: colors.text }]} numberOfLines={1}>
            {subscription.subscriptionName}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ACTIVE PLAN</Text>
          </View>
        </View>
        <Text style={styles.bannerSubtitle}>
          Purchased Price: <Text style={styles.boldText}>₹{Number(subscription.purchasedPrice).toLocaleString("en-IN")}</Text>
        </Text>
        <Text style={styles.dateText}>
          Validity: {formatDate(subscription.startsAt)} to {formatDate(subscription.expiresAt)}
        </Text>
        <View style={styles.daysLeftContainer}>
          <Ionicons name="hourglass-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.daysLeftText, { color: colors.primary }]}>
            {subscription.daysLeft} {subscription.daysLeft === 1 ? "day" : "days"} remaining
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    shadowColor: "#0B1A3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  bannerTextWrap: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 6,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  badge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: "#16A34A",
    fontSize: 9,
    fontWeight: "800",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  boldText: {
    fontWeight: "700",
    color: "#111827",
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  daysLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  daysLeftText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
