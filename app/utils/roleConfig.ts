import { Ionicons } from '@expo/vector-icons';

export type RoleType = 'company' | 'employee';

export interface TabItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

export interface DrawerItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  actionType?: 'logout';
}

export interface RoleNavigationConfig {
  tabs: TabItem[];
  drawer: DrawerItem[];
}

export const roleConfig: Record<RoleType, RoleNavigationConfig> = {
  company: {
    tabs: [
      { label: 'Dashboard', icon: 'grid-outline', route: '/(company)/(tabs)/' },
      { label: 'Employees', icon: 'people-outline', route: '/(company)/(tabs)/employees' },
      { label: 'Attendance', icon: 'calendar-outline', route: '/(company)/(tabs)/attendance' },
      { label: 'Expense', icon: 'wallet-outline', route: '/(company)/(tabs)/expense' },
    ],
    drawer: [
      { label: 'Dashboard', icon: 'grid', route: '/(company)/(tabs)/' },
      { label: 'Employees', icon: 'people', route: '/(company)/(tabs)/employees' },
      { label: 'Attendance', icon: 'calendar', route: '/(company)/(tabs)/attendance' },
      { label: 'Expense', icon: 'wallet', route: '/(company)/(tabs)/expense' },
      { label: 'Logout', icon: 'log-out-outline', actionType: 'logout' },
    ],
  },
  employee: {
    tabs: [
      { label: 'Dashboard', icon: 'grid-outline', route: '/(employee)/(tabs)/' },
      { label: 'Attendance', icon: 'calendar-outline', route: '/(employee)/(tabs)/attendance' },
      { label: 'Expense', icon: 'wallet-outline', route: '/(employee)/(tabs)/expense' },
      { label: 'Profile', icon: 'person-outline', route: '/(employee)/(tabs)/profile' },
    ],
    drawer: [
      { label: 'Dashboard', icon: 'grid', route: '/(employee)/(tabs)/' },
      { label: 'Attendance', icon: 'calendar', route: '/(employee)/(tabs)/attendance' },
      { label: 'Expense', icon: 'wallet', route: '/(employee)/(tabs)/expense' },
      { label: 'Logout', icon: 'log-out-outline', actionType: 'logout' },
    ],
  },
};
