import { api } from '@/api/api';
import { endpoints } from '@/api/apis';

export interface CustomerMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CustomerItem {
  id: number;
  company_id: number;
  company_name: string;
  customer_name: string;
  phone: string;
  alternate_phone: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  gstin_number: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerListResponse {
  success: boolean;
  message: string;
  data: CustomerItem[];
  meta: CustomerMeta;
}

export interface CreateCustomerPayload {
  customer_name: string;
  phone: string;
  address_line1: string;
  city: string;
  state: string;
  alternate_phone?: string;
  email?: string;
  address_line2?: string;
  pincode?: string;
  gstin_number?: string;
}

export interface CreateCustomerResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: { id: number } | [];
  error: boolean | { field: string; message: string }[];
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'created_at' | 'name' | 'phone' | 'city' | 'state';
  order?: 'ASC' | 'DESC';
}

export const getCustomers = async (filters?: CustomerFilters): Promise<CustomerListResponse> => {
  const params: Record<string, string> = {};
  if (filters?.page !== undefined) params.page = String(filters.page);
  if (filters?.limit !== undefined) params.limit = String(filters.limit);
  if (filters?.search?.trim()) params.search = filters.search.trim();
  if (filters?.city?.trim()) params.city = filters.city.trim();
  if (filters?.state?.trim()) params.state = filters.state.trim();
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.order) params.order = filters.order;

  const res = await api.get<CustomerListResponse>(endpoints.customer.getAll, { params });
  return res.data;
};

export const createCustomer = async (payload: CreateCustomerPayload): Promise<CreateCustomerResponse> => {
  const res = await api.post<CreateCustomerResponse>(endpoints.customer.create, payload);
  return res.data;
};
