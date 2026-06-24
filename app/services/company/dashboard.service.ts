import { api } from "@/api/api";
import { endpoints } from "@/api/apis";

export const getCompanyDashboardStats = async (month: number, year: number) => {
  const { data } = await api.get(endpoints.companyDashboard.stats, {
    params: { month, year },
  });
  return data;
};

export const getCompanyExpenseByType = async (month: number, year: number) => {
  const { data } = await api.get(endpoints.companyDashboard.expenseByType, {
    params: { month, year },
  });
  return data;
};
