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
    ...payload,
    employee_code: "EMP002",
  });
  return data;
};
