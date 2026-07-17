import React, { useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { useSubscription } from "@/hooks/useSubscription";
import {
  SubscriptionHeader,
  CurrentPlanBanner,
  SubscriptionCard,
  SubscriptionSkeleton,
} from "@/components/company/subscription";
import { type MasterSubscription } from "@/services/company/subscription.service";

export default function Subscriptions() {
  const { colors } = theme;
  const {
    plans,
    currentSubscription,
    loading,
    refreshing,
    purchaseLoading,
    error,
    refresh,
    purchasePlan,
    retry,
  } = useSubscription();

  const [activePurchaseId, setActivePurchaseId] = useState<number | null>(null);

  const handlePurchase = (plan: MasterSubscription) => {
    Alert.alert(
      "Confirm Purchase",
      `Are you sure you want to purchase the "${plan.SubscriptionName}" plan for ₹${Number(plan.Price).toLocaleString("en-IN")}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Purchase",
          onPress: async () => {
            setActivePurchaseId(plan.SubscriptionId);
            const res = await purchasePlan(plan.SubscriptionId);
            setActivePurchaseId(null);
            
            if (res.success) {
              Alert.alert("Success", "Subscription purchased successfully!");
            } else {
              if (res.statusCode === 409) {
                Alert.alert(
                  "Purchase Conflict",
                  "Your company already has an active subscription. You cannot buy another plan while the current one is active."
                );
              } else {
                Alert.alert("Purchase Failed", res.message || "Something went wrong.");
              }
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <SubscriptionSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Failed to Load</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={retry}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <FlatList
        data={plans}
        keyExtractor={(item) => String(item.SubscriptionId)}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.white}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Header Title & Subtitle */}
            {/* <SubscriptionHeader /> */}

            {/* Current Active Plan summary card */}
            <CurrentPlanBanner subscription={currentSubscription} />

            {/* Section label for packages */}
            {plans.length > 0 && (
              <Text style={styles.sectionTitle}>Available Packages</Text>
            )}
          </>
        }
        renderItem={({ item: plan }) => (
          <SubscriptionCard
            plan={plan}
            onPurchase={handlePurchase}
            purchaseLoading={purchaseLoading && activePurchaseId === plan.SubscriptionId}
            purchaseDisabled={purchaseLoading}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No subscription plans available right now.</Text>
          </View>
        }
        ListFooterComponent={
          plans.length > 0 ? (
            <View style={styles.footerNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.footerNoteText}>
                All plans include 24/7 Support and Regular Updates
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: "#F3F5F9",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4B5563",
    marginBottom: 12,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  footerNoteText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});