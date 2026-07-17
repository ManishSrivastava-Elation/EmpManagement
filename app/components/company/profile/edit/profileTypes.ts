export interface CompanyProfileFormData {
  company_name: string;
  contact_person_name: string;
  designation: string;
  email: string;
  mobile: string;
}

export type CompanyProfileFormErrors = {
  company_name?: string;
  contact_person_name?: string;
  designation?: string;
  email?: string;
  mobile?: string;
};
