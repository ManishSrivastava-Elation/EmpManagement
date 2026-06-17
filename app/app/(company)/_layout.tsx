import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { usePathname } from 'expo-router';
import CustomDrawer from '@/components/navigation/CustomDrawer';
import { theme } from '@/theme';

const { colors } = theme;

const titleMap: Record<string, string> = {
  employees: 'Employees',
  attendance: 'Attendance',
  expense: 'Expense',
};

export default function CompanyLayout() {
  const pathname = usePathname();
  const segment = pathname.split('/').filter(Boolean).pop() || '';
  const title = titleMap[segment] || 'Dashboard';

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
        drawerStyle: { width: '75%' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 16 }}>
            <Ionicons name="menu" size={26} color={colors.white} />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen name="(tabs)" options={{ title, drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}
