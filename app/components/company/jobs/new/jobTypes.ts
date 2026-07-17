export interface JobFormData {
  customer_id: number | null;
  job_title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date: string;
}

export type JobFormErrors = {
  [K in keyof JobFormData]?: string;
};

export const INITIAL_JOB_FORM: JobFormData = {
  customer_id: null,
  job_title: '',
  description: '',
  priority: 'MEDIUM',
  due_date: '',
};
