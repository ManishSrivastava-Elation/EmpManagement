import { api } from "@/api/api";
import { endpoints } from "@/api/apis";

export interface MasterSubscription {
  SubscriptionId: number;
  SubscriptionName: string;
  Price: number;
  DurationDays: number;
  Description: string;
  Recommended: boolean | number;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CompanySubscription {
  subscriptionName: string;
  purchasedPrice: number;
  startsAt: string;
  expiresAt: string;
  daysLeft: number;
  status: string;
}

export interface PurchaseResponseData {
  companySubscriptionId: number;
  companyId: number;
  subscriptionId: number;
  startsAt: string;
  expiresAt: string;
  status: string;
}

export interface PurchaseResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PurchaseResponseData | null;
  error: boolean;
  meta: any;
  timestamp: string;
}

export const getMasterSubscriptions = async (): Promise<{ success: boolean; data: MasterSubscription[] }> => {
  const response = await api.get(endpoints.subscription.getMaster);
  return response.data;
};

export const purchaseSubscription = async (
  subscriptionId: number
): Promise<PurchaseResponse> => {
  const response = await api.post(endpoints.subscription.purchase, {
    subscriptionId,
  });
  return response.data;
};

export const getCurrentSubscription = async (): Promise<{ success: boolean; data: CompanySubscription | null }> => {
  const response = await api.get(endpoints.subscription.getCurrent);
  return response.data;
};
