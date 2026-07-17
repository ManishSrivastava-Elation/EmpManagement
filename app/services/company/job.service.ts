import { api } from '@/api/api';
import { endpoints } from '@/api/apis';

export interface JobItem {
  id: number;
  company_id: number;
  customer_id: number;
  customer_name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin_number?: string;
  job_title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface JobMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface JobListResponse {
  success: boolean;
  message: string;
  data: JobItem[];
  meta: JobMeta;
}

export interface CustomerOptionItem {
  id: number;
  customer_name: string;
}

export interface CustomerOptionsResponse {
  success: boolean;
  message: string;
  data: CustomerOptionItem[];
}

export interface CreateJobPayload {
  customer_id: number;
  job_title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date: string;
}

export interface CreateJobResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: { job_id: number } | [];
  error: boolean | { field: string; message: string }[];
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: string;
  customer_id?: number;
  dueDateFrom?: string;
  dueDateTo?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'id' | 'job_title' | 'priority' | 'due_date' | 'created_at';
  order?: 'ASC' | 'DESC';
}

export interface JobDetailEmployee {
  id: number;
  employee_name: string;
  phone: string;
  email: string;
}

export interface JobDetailCustomer {
  id: number;
  customer_name: string;
  phone: string;
  alternate_phone?: string | null;
  email?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  gstin_number?: string | null;
}

export interface JobDetail {
  id: number;
  job_title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  due_date: string;
  created_at: string;
  updated_at?: string | null;
}

export interface JobDetailsData {
  job: JobDetail;
  customer: JobDetailCustomer;
  employee: JobDetailEmployee | null;
}

export interface JobDetailsResponse {
  success: boolean;
  message: string;
  data: JobDetailsData;
}

export interface EmployeeOption {
  id: number;
  employee_name: string;
}

export interface EmployeeOptionsResponse {
  success: boolean;
  message: string;
  data: EmployeeOption[];
}

export interface AssignJobPayload {
  job_id: number;
  employee_id: number;
}

export interface AssignJobResponse {
  success: boolean;
  message: string;
  data: { assignment_id: number };
}

export const getJobs = async (filters?: JobFilters): Promise<JobListResponse> => {
  const params: Record<string, string> = {};
  if (filters?.page !== undefined) params.page = String(filters.page);
  if (filters?.limit !== undefined) params.limit = String(filters.limit);
  if (filters?.search?.trim()) params.search = filters.search.trim();
  if (filters?.priority) params.priority = filters.priority;
  if (filters?.status) params.status = filters.status;
  if (filters?.customer_id !== undefined) params.customer_id = String(filters.customer_id);
  if (filters?.dueDateFrom) params.dueDateFrom = filters.dueDateFrom;
  if (filters?.dueDateTo) params.dueDateTo = filters.dueDateTo;
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.order) params.order = filters.order;

  const res = await api.get<JobListResponse>(endpoints.job.list, { params });
  return res.data;
};

export const createJob = async (payload: CreateJobPayload): Promise<CreateJobResponse> => {
  const res = await api.post<CreateJobResponse>(endpoints.job.create, payload);
  return res.data;
};

export const getCustomerOptions = async (search?: string): Promise<CustomerOptionsResponse> => {
  const params: Record<string, string> = {};
  if (search?.trim()) params.search = search.trim();
  const res = await api.get<CustomerOptionsResponse>(endpoints.customer.options, { params });
  return res.data;
};

export const getJobDetails = async (jobId: number): Promise<JobDetailsResponse> => {
  const res = await api.get<JobDetailsResponse>(endpoints.job.details(jobId));
  return res.data;
};

export const assignJob = async (payload: AssignJobPayload): Promise<AssignJobResponse> => {
  const res = await api.post<AssignJobResponse>(endpoints.job.assign, payload);
  return res.data;
};

export const getEmployeeOptions = async (search?: string, phone?: string): Promise<EmployeeOptionsResponse> => {
  const params: Record<string, string> = {};
  if (search?.trim()) params.search = search.trim();
  if (phone?.trim()) params.phone = phone.trim();
  const res = await api.get<EmployeeOptionsResponse>(endpoints.employeeOptions, { params });
  return res.data;
};
