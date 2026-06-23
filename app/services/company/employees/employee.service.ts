import { api } from '@/api/api';
import { endpoints } from '@/api/apis';
import { EmployeeApiResponse } from '@/components/company/employees/types';

export const getEmployees = async (): Promise<EmployeeApiResponse> => {
  console.log("Employyee API Called.............");  
  const res = await api.get<EmployeeApiResponse>(endpoints.employees.getAll);
  return res.data;
};

export const updateEmployeeStatus = async (employeeId: number, status: string) => {
  const res = await api.patch(endpoints.employees.updateStatus(employeeId), { status });
  return res.data;
};
