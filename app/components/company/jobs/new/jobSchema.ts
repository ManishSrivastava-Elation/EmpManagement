import * as yup from 'yup';

export const jobSchema = yup.object({
  customer_id: yup
    .number()
    .nullable()
    .required('Customer is required')
    .typeError('Customer is required'),

  job_title: yup
    .string()
    .trim()
    .required('Job title is required')
    .min(2, 'Job title must be at least 2 characters')
    .max(255, 'Job title must be at most 255 characters'),

  description: yup
    .string()
    .trim()
    .max(1000, 'Description must be at most 1000 characters'),

  priority: yup
    .string()
    .oneOf(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 'Invalid priority')
    .required('Priority is required'),

  due_date: yup
    .string()
    .trim()
    .required('Due date and time is required'),
});
