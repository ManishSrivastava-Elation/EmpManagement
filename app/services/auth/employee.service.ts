import { api } from "@/api/api";
import { endpoints } from "@/api/apis";

export const employeeLogin = async (identifier: string, password: string) => {
  const { data } = await api.post(endpoints.employee.employeeLogin, { identifier, password });
  return data;
};

export const registerEmployee = async (payload: {
  company_id: number;
  full_name: string;
  email: string;
  mobile_no: string;
  password: string;
}) => {
  const { data } = await api.post(endpoints.employee.registerEmployee, {
    ...payload
  });
  return data;
};

export interface EmployeeProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  employee_code: string;
  company_name: string;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export const getEmployeeProfile = async (): Promise<{ success: boolean; data: EmployeeProfile }> => {
  const { data } = await api.get(endpoints.employee.profile);
  return data;
};

export const updateEmployeeProfile = async (payload: { name: string; email: string; phone: string }): Promise<{ success: boolean; data: EmployeeProfile; message?: string }> => {
  const { data } = await api.put(endpoints.employee.updateProfile, payload);
  return data;
};

export const updatePassword = async (payload: Record<string, string>): Promise<{ success: boolean; message?: string }> => {
  const { data } = await api.put(endpoints.employee.updatePassword, payload);
  return data;
};
