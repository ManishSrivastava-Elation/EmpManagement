import CustomDrawer from "@/components/navigation/CustomDrawer";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { TouchableOpacity } from "react-native";

const { colors } = theme;

const titleMap: Record<string, string> = {
  employees: "Employees",
  attendance: "Attendance",
  expense: "Expense",
  profile: "Profile",
  subscription: "Subscription",
  jobs: "Jobs",
  customers: "Customers",
};

export default function CompanyLayout() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).pop() || "";
  const title = titleMap[segment] || "Dashboard";

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "600" },
        drawerStyle: { width: "75%" },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="menu" size={26} color={colors.white} />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{ title, drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen name="Profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="subscription" options={{ title: "Subscription" }} />
      <Drawer.Screen name="jobs" options={{ title: "Jobs" }} />
      <Drawer.Screen name="customers" options={{ title: "Customers" }} />
      <Drawer.Screen name="add-job" options={{ title: "Add Job" }} />
      <Drawer.Screen name="job-details" options={{ title: "Job Details", drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="edit-profile" options={{ title: "Edit Profile", drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="update-password" options={{ title: "Update Password", drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}
