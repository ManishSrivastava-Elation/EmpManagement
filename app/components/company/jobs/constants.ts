import { theme } from '@/theme';
import type { JobFilters } from '@/services/company/job.service';

export const BLUE = theme.colors.primary;
export const ICON_BG = '#DBEAFE';
export const LABEL_COLOR = '#9CA3AF';
export const VALUE_COLOR = '#1F2937';
export const BG = '#F2F5FB';
export const DIVIDER_COLOR = '#E8EBF2';

export interface ActiveFilters {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | '';
  customer_id: number | '';
  startDate: string;
  endDate: string;
  sortBy: JobFilters['sortBy'];
  order: 'ASC' | 'DESC';
}

export const DEFAULT_FILTERS: ActiveFilters = {
  priority: '',
  customer_id: '',
  startDate: '',
  endDate: '',
  sortBy: 'created_at',
  order: 'DESC',
};

export const PRIORITY: Record<
  string,
  { bg: string; color: string; label: string; iconBg: string; icon: string }
> = {
  URGENT: {
    bg: '#FEE2E2',
    color: '#991B1B',
    label: 'Critical',
    iconBg: '#FEE2E2',
    icon: 'alert-circle',
  },
  HIGH: {
    bg: '#FDEAEA',
    color: '#EF4444',
    label: 'High',
    iconBg: '#FDEAEA',
    icon: 'alert-circle',
  },
  MEDIUM: {
    bg: '#FFF4E0',
    color: '#F59E0B',
    label: 'Medium',
    iconBg: '#FFF4E0',
    icon: 'construct',
  },
  LOW: {
    bg: '#ECFDF3',
    color: '#16A34A',
    label: 'Low',
    iconBg: '#ECFDF3',
    icon: 'checkmark-circle',
  },
};

export const SORT_OPTIONS: { label: string; value: JobFilters['sortBy'] }[] = [
  { label: 'Created Date', value: 'created_at' },
  { label: 'Job Title', value: 'job_title' },
  { label: 'Priority', value: 'priority' },
  { label: 'Due Date', value: 'due_date' },
];
