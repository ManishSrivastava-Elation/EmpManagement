import * as yup from 'yup';

export const profileSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Enter a valid email address'),
  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
});
