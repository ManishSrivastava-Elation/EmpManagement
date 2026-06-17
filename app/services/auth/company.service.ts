import { api } from "@/api/api";
import { endpoints } from "@/api/apis";

export const companyLogin = async (identifier: string, password: string) => {
  const { data } = await api.post(endpoints.company.companyLogin, { identifier, password });  
  return data;
};
export const companyOptionsList = async () => {
  const { data } = await api.get(endpoints.company.options);  
  return data;
};
