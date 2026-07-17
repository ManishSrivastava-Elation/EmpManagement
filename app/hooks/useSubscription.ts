import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  purchaseSubscription as apiPurchaseSubscription,
  getCurrentSubscription,
  getMasterSubscriptions,
  type CompanySubscription,
  type MasterSubscription,
  type PurchaseResponse,
} from "@/services/company/subscription.service";

export function useSubscription() {
  const [plans, setPlans] = useState<MasterSubscription[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CompanySubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch master subscriptions and current active subscription
      const [plansRes, currentRes] = await Promise.all([
        getMasterSubscriptions(),
        getCurrentSubscription(),
      ]);

      if (plansRes?.success) {
        // Filter to display only ACTIVE status subscriptions
        const activePlans = (plansRes.data || []).filter(
          (plan) => plan.Status === "ACTIVE"
        );
        setPlans(activePlans);
      } else {
        throw new Error("Failed to load plans");
      }

      if (currentRes?.success) {
        setCurrentSubscription(currentRes.data);
      } else {
        setCurrentSubscription(null);
      }
    } catch (err: any) {
      console.error("Error in useSubscription hook:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const purchasePlan = useCallback(
    async (subscriptionId: number): Promise<PurchaseResponse> => {
      setPurchaseLoading(true);
      try {
        const result = await apiPurchaseSubscription(subscriptionId);
        if (result.success) {
          // Refetch active subscription to update layout immediately
          const currentRes = await getCurrentSubscription();
          if (currentRes?.success) {
            setCurrentSubscription(currentRes.data);
          }
        }
        return result;
      } catch (err: any) {
        console.error("Error purchasing subscription:", err);
        const errorMsg =
          err?.response?.data?.message || err?.message || "Purchase failed";
        const failRes: PurchaseResponse = {
          success: false,
          statusCode: err?.response?.status || 400,
          message: errorMsg,
          data: null,
          error: true,
          meta: null,
          timestamp: new Date().toISOString(),
        };
        return failRes;
      } finally {
        setPurchaseLoading(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptionData();
    }, [fetchSubscriptionData])
  );

  return {
    plans,
    currentSubscription,
    loading,
    refreshing,
    purchaseLoading,
    error,
    refresh: () => fetchSubscriptionData(true),
    purchasePlan,
    retry: () => fetchSubscriptionData(false),
  };
}
