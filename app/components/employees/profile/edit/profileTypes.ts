export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  employee_code: string;
  company_name: string;
}

export type ProfileFormErrors = {
  name?: string;
  email?: string;
  phone?: string;
};
