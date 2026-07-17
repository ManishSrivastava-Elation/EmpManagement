import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import PurchaseButton from "./PurchaseButton";
import { type MasterSubscription } from "@/services/company/subscription.service";

interface SubscriptionCardProps {
  plan: MasterSubscription;
  onPurchase: (plan: MasterSubscription) => void;
  purchaseLoading: boolean;
  purchaseDisabled: boolean;
}

export default function SubscriptionCard({
  plan,
  onPurchase,
  purchaseLoading,
  purchaseDisabled,
}: SubscriptionCardProps) {
  const { colors } = theme;

  const isRecommended = plan.Recommended === 1 || plan.Recommended === true;

  // Accents mapping dynamically based on subscription ID / name
  const getAccent = () => {
    if (isRecommended) {
      return {
        text: colors.primary,
        iconBg: colors.primary,
        border: "#BFDBFE",
        bg: "#F0F9FF",
        icon: "diamond" as keyof typeof Ionicons.glyphMap,
      };
    }
    // Alternate other plans
    const isEven = plan.SubscriptionId % 2 === 0;
    if (isEven) {
      return {
        text: colors.success,
        iconBg: colors.success,
        border: "#BBF7D0",
        bg: "#F0FDF4",
        icon: "star" as keyof typeof Ionicons.glyphMap,
      };
    } else {
      return {
        text: "#7C3AED", // Purple
        iconBg: "#7C3AED",
        border: "#E9D5FF",
        bg: "#F9F5FF",
        icon: "paper-plane" as keyof typeof Ionicons.glyphMap,
      };
    }
  };

  const accent = getAccent();
  const formattedPrice = `₹${Number(plan.Price).toLocaleString("en-IN")}`;

  return (
    <View
      style={[
        styles.card,
        isRecommended && {
          borderColor: accent.border,
          borderWidth: 2,
          backgroundColor: accent.bg,
        },
      ]}
    >
      {isRecommended && (
        <View style={[styles.recommendedBadge, { backgroundColor: accent.text }]}>
          <Ionicons name="star" size={12} color="#FFFFFF" />
          <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: accent.iconBg }]}>
          <Ionicons name={accent.icon} size={24} color="#FFFFFF" />
        </View>

        <View style={styles.titleWrap}>
          <Text style={[styles.planName, { color: accent.text }]}>
            {plan.SubscriptionName}
          </Text>
          <View style={[styles.idBadge, { backgroundColor: accent.iconBg + "1A" }]}>
            <Text style={[styles.idBadgeText, { color: accent.text }]}>
              PLAN #{plan.SubscriptionId}
            </Text>
          </View>
        </View>

        <View style={styles.priceWrap}>
          <Text style={[styles.priceText, { color: accent.text }]}>
            {formattedPrice}
          </Text>
          <Text style={styles.priceCycle}>/ {plan.DurationDays} Days</Text>
        </View>
      </View>

      <Text style={styles.description}>{plan.Description}</Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <View>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{plan.DurationDays} Days</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#6B7280" />
          <View>
            <Text style={styles.detailLabel}>Support</Text>
            <Text style={styles.detailValue}>24/7 Support</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="sparkles-outline" size={16} color="#6B7280" />
          <View>
            <Text style={styles.detailLabel}>Updates</Text>
            <Text style={styles.detailValue}>Included</Text>
          </View>
        </View>
      </View>

      <PurchaseButton
        onPress={() => onPurchase(plan)}
        loading={purchaseLoading}
        disabled={purchaseDisabled}
        isRecommended={isRecommended}
        accentColor={accent.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0B1A3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  recommendedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  recommendedBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 8,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  idBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  priceWrap: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "800",
  },
  priceCycle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
  },
});
