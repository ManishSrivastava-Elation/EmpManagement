import { api } from "@/api/api";
import { endpoints } from "@/api/apis";

export interface CompanyProfile {
  company_id: number;
  company_name: string;
  logo_url: string | null;
  contact_person_name: string | null;
  designation: string | null;
  email: string | null;
  mobile: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const getCompanyProfile = async (): Promise<{ success: boolean; data: CompanyProfile }> => {
  const response = await api.get(endpoints.company.profile);
  return response.data;
};

export const updateCompanyProfile = async (
  id: string | number,
  payload: Partial<CompanyProfile>
): Promise<{ success: boolean; data: CompanyProfile; message?: string }> => {
  const { data } = await api.put(endpoints.company.updateProfile(id), payload);
  return data;
};

export const updateCompanyPassword = async (
  payload: Record<string, string>
): Promise<{ success: boolean; message?: string }> => {
  const { data } = await api.put(endpoints.company.updatePassword, payload);
  return data;
};
