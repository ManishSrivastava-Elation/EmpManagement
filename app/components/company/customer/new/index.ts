// Barrel export — import everything from a single path
export { default as CustomerForm } from './CustomerForm';
export { default as CustomerBasicInfo } from './CustomerBasicInfo';
export { default as CustomerAddressSection } from './CustomerAddressSection';
export { default as CustomerTaxSection } from './CustomerTaxSection';
export { useCustomerForm } from './useCustomerForm';
export { customerSchema } from './customerSchema';
export type { CustomerFormData, CustomerFormErrors } from './customerTypes';
export { INITIAL_CUSTOMER_FORM } from './customerTypes';
