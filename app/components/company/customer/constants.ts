import { theme } from '@/theme';
import type { CustomerFilters } from '@/services/company/customer.service';

export const NAVY = '#1B2E6F';
export const BLUE = theme.colors.primary;
export const ICON_BG = '#DBEAFE';
export const LABEL_COLOR = '#9CA3AF';
export const VALUE_COLOR = '#1F2937';
export const BG = '#F2F5FB';
export const DIVIDER_COLOR = '#E8EBF2';

export interface ActiveFilters {
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  sortBy: CustomerFilters['sortBy'];
  order: 'ASC' | 'DESC';
}

export const DEFAULT_FILTERS: ActiveFilters = {
  city: '', state: '', startDate: '', endDate: '',
  sortBy: 'created_at', order: 'DESC',
};

export const SORT_OPTIONS: { label: string; value: CustomerFilters['sortBy'] }[] = [
  { label: 'Created Date', value: 'created_at' },
  { label: 'Customer Name', value: 'name' },
  { label: 'Phone', value: 'phone' },
  { label: 'City', value: 'city' },
  { label: 'State', value: 'state' },
];
