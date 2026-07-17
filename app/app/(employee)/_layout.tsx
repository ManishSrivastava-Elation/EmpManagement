import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { usePathname } from 'expo-router';
import CustomDrawer from '@/components/navigation/CustomDrawer';
import { theme } from '@/theme';

const { colors } = theme;

const titleMap: Record<string, string> = {
  attendance: 'Attendance',
  expense: 'Expense',
  profile: 'Profile',
  job: 'Job',
};

export default function EmployeeLayout() {
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
      <Drawer.Screen name="edit-profile" options={{ title: 'Edit Profile', drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="update-password" options={{ title: 'Update Password', drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="job-details" options={{ title: 'Job Details', drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}
