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

export const registerCompany = async (payload: {
  company_name: string;
  contact_person_name: string;
  designation: string;
  email: string;
  mobile: string;
  password: string;
  logo?: { uri: string; name: string; type: string } | null;
}) => {
  const formData = new FormData();
  formData.append("company_name", payload.company_name);
  formData.append("contact_person_name", payload.contact_person_name);
  formData.append("designation", payload.designation);
  formData.append("email", payload.email);
  formData.append("mobile", payload.mobile);
  formData.append("password", payload.password);
  if (payload.logo) {
    formData.append("logo", payload.logo as any);
  }
  const { data } = await api.post(endpoints.company.companyRegister, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
