import { api } from '@/api/api';
import { endpoints } from '@/api/apis';
import { EmployeeApiItem } from '@/components/company/employees/types';

export interface EmployeeMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EmployeeListResponse {
  success: boolean;
  data: EmployeeApiItem[];
  meta: EmployeeMeta;
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const getEmployees = async (filters?: EmployeeFilters): Promise<EmployeeListResponse> => {
  const params: Record<string, string> = {};
  if (filters?.page !== undefined) params.page = String(filters.page);
  if (filters?.limit !== undefined) params.limit = String(filters.limit);
  if (filters?.search?.trim()) params.search = filters.search.trim();
  if (filters?.status) params.status = filters.status;

  const res = await api.get<EmployeeListResponse>(endpoints.employees.getAll, { params });
  return res.data;
};

export const updateEmployeeStatus = async (employeeId: number, status: string) => {
  const res = await api.patch(endpoints.employees.updateStatus(employeeId), { status });
  return res.data;
};
