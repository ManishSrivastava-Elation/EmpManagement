import { api } from "@/api/api";
import { endpoints } from "@/api/apis";

export const employeeLogin = async (identifier: string, password: string) => {
  const { data } = await api.post(endpoints.employee.employeeLogin, { identifier, password });
  return data;
};
