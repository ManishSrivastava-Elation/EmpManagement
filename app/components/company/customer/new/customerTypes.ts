// ─── Form Data ───────────────────────────────────────────────────────────────

export type CustomerFormData = {
  customer_name: string;
  phone: string;
  alternate_phone: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  gstin_number: string;
};

// ─── Errors ──────────────────────────────────────────────────────────────────

export type CustomerFormErrors = Partial<Record<keyof CustomerFormData, string>>;

// ─── Initial State ───────────────────────────────────────────────────────────

export const INITIAL_CUSTOMER_FORM: CustomerFormData = {
  customer_name: '',
  phone: '',
  alternate_phone: '',
  email: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  gstin_number: '',
};
