import { api } from '@/api/api';
import { endpoints } from '@/api/apis';

export type ExpenseStatus = 'approved' | 'pending' | 'rejected' | 'paid';

export interface ApiExpense {
  ExpenseId: number;
  ExpenseDate: string;
  EmployeeId: number;
  EmployeeName: string;
  Title: string;
  Description: string;
  Amount: string;
  Status: ExpenseStatus;
  ReceiptUrl?: string;
}

export interface ExpenseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  status?: 'all' | ExpenseStatus;
  search?: string;
  employee_id?: number;
  sortBy?: 'ExpenseDate' | 'Amount' | 'Status' | 'EmployeeName';
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ExpenseListResponse {
  success: boolean;
  data: ApiExpense[];
  meta: ExpenseMeta;
}

export interface ExpenseType {
  id: number;
  name: string;
}

export const getExpenses = async (filters?: ExpenseFilters): Promise<ExpenseListResponse> => {
  const params: Record<string, string> = {};
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  if (filters?.status && filters.status !== 'all') params.status = filters.status;
  if (filters?.search?.trim()) params.search = filters.search.trim();
  if (filters?.employee_id !== undefined) params.employee_id = String(filters.employee_id);
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.order) params.order = filters.order;
  if (filters?.page !== undefined) params.page = String(filters.page);
  if (filters?.limit !== undefined) params.limit = String(filters.limit);

  const response = await api.get(endpoints.expense.getAll, { params });
  return response.data;
};

export const getExpenseTypes = async (): Promise<{ data: ExpenseType[] }> => {
  const response = await api.get(endpoints.expense.types);
  return response.data;
};

export const createExpense = async (data: {
  title: string;
  description: string;
  amount: number;
  expenseDate: string;
  receiptFile?: { uri: string; name: string; type: string } | null;
}) => {
  const formData = new FormData();
  formData.append('Title', data.title);
  formData.append('Description', data.description);
  formData.append('Amount', data.amount.toString());
  formData.append('ExpenseDate', data.expenseDate);
  if (data.receiptFile) {
    formData.append('ReceiptUrl', {
      uri: data.receiptFile.uri,
      name: data.receiptFile.name,
      type: data.receiptFile.type,
    } as any);
  }
  const response = await api.post(endpoints.expense.create, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateExpenseStatus = async (expenseId: number, status: ExpenseStatus) => {
  const response = await api.patch(endpoints.expense.updateStatus(expenseId), { Status: status });
  return response.data;
};
