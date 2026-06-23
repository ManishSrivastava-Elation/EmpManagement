import { api } from '@/api/api';
import { endpoints } from '@/api/apis';

export interface ApiExpense {
  ExpenseId: number;
  ExpenseDate: string;
  EmployeeId: number;
  EmployeeName: string;
  Title: string;
  Description: string;
  Amount: string;
  Status: 'approved' | 'pending' | 'rejected' | 'paid';
  ReceiptUrl?: string;
}

export interface MetaCounts {
  total: number;
  pending: string;
  approved: string;
  paid: string;
  rejected: string;
}

export interface ExpenseListResponse {
  data: ApiExpense[];
  meta?: { counts: MetaCounts };
}

export interface ExpenseType {
  id: number;
  name: string;
}

export const getUserExpenses = async (month: number, year: number): Promise<ExpenseListResponse> => {
  const response = await api.get(endpoints.expense.getAll, { params: { month, year } });
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
