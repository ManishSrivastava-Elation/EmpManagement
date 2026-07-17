import * as yup from 'yup';

// GSTIN format: 2-digit state code + 5-letter PAN + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;

export const customerSchema = yup.object({
  // ── Basic Information ─────────────────────────────────────────────────────
  customer_name: yup
    .string()
    .trim()
    .required('Customer name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters'),

  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits'),

  alternate_phone: yup
    .string()
    .trim()
    .test(
      'alternate-phone-length',
      'Alternate phone must be exactly 10 digits',
      (val) => !val || val === '' || /^[0-9]{10}$/.test(val),
    ),

  email: yup
    .string()
    .trim()
    .test(
      'optional-email',
      'Enter a valid email address',
      (val) => !val || val === '' || yup.string().email().isValidSync(val),
    ),

  // ── Address Information ───────────────────────────────────────────────────
  address_line1: yup
    .string()
    .trim()
    .required('Address Line 1 is required'),

  address_line2: yup.string().trim(),

  city: yup
    .string()
    .trim()
    .required('City is required'),

  state: yup
    .string()
    .trim()
    .required('State is required'),

  pincode: yup
    .string()
    .trim()
    .test(
      'pincode-6-digits',
      'Pincode must be exactly 6 digits',
      (val) => !val || val === '' || /^[0-9]{6}$/.test(val),
    ),

  // ── Tax Information ───────────────────────────────────────────────────────
  gstin_number: yup
    .string()
    .trim()
    .test(
      'gstin-format',
      'Invalid GSTIN format (e.g. 09ABCDE1234F1Z5)',
      (val) => !val || val === '' || GSTIN_REGEX.test(val.toUpperCase()),
    ),
});
