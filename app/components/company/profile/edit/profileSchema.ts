import * as yup from 'yup';

export const companyProfileSchema = yup.object({
  company_name: yup
    .string()
    .trim()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be at most 100 characters'),
  contact_person_name: yup
    .string()
    .trim()
    .required('Contact person name is required')
    .min(2, 'Contact person name must be at least 2 characters')
    .max(100, 'Contact person name must be at most 100 characters'),
  designation: yup
    .string()
    .trim()
    .required('Designation is required')
    .min(2, 'Designation must be at least 2 characters')
    .max(100, 'Designation must be at most 100 characters'),
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Enter a valid email address'),
  mobile: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
});
