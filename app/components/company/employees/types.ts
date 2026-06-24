// components/company/employees/types.ts

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Employee {
  employee_id?: number;
  employee_code: string;
  full_name: string;
  email: string;
  mobile_no: string;
  status: EmployeeStatus;
  created_at: string;
}

export interface EmployeeApiItem {
  employee_id: number;
  company_id: number;
  company_name: string;
  employee_code: string;
  full_name: string;
  mobile_no: string;
  email: string;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: EmployeeApiItem[];
  error: boolean;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  timestamp: string;
}