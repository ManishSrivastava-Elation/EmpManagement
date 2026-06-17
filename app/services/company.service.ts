import { api } from "@/api/api";
import { endpoints } from "@/api/apis";

export const companyLogin = async (identifier: string, password: string) => {
  const response = await api.post(endpoints.company.companyLogin, { identifier, password });  
  return response;
};
