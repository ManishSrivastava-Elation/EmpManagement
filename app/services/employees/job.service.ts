import { api } from '@/api/api';
import { endpoints } from '@/api/apis';
import type {
  JobListResponse,
  JobDetailsResponse,
  JobFilters,
} from '@/services/company/job.service';

export type {
  JobItem,
  JobMeta,
  JobDetail,
  JobDetailCustomer,
  JobDetailEmployee,
  JobDetailsData,
  JobDetailsResponse,
} from '@/services/company/job.service';

export const getEmployeeJobs = async (filters?: JobFilters): Promise<JobListResponse> => {
  const params: Record<string, string> = {};
  if (filters?.page !== undefined) params.page = String(filters.page);
  if (filters?.limit !== undefined) params.limit = String(filters.limit);
  if (filters?.search?.trim()) params.search = filters.search.trim();
  if (filters?.priority) params.priority = filters.priority;
  if (filters?.status) params.status = filters.status;
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.order) params.order = filters.order;

  const res = await api.get<JobListResponse>(endpoints.job.list, { params });
  return res.data;
};

export const getEmployeeJobDetails = async (jobId: number): Promise<JobDetailsResponse> => {
  const res = await api.get<JobDetailsResponse>(endpoints.job.details(jobId));
  return res.data;
};
