import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import {
  getSession,
  clearSession,
  type UserSession,
} from "../../services/storage.service";
import {
  roleConfig,
  type RoleType,
  type DrawerItem,
} from "../../utils/roleConfig";
import { colors } from "../../theme/colors";
import Footer from "../common/Footer";

export default function CustomDrawer(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  const role: RoleType = session?.role ?? "employee";
  const config = roleConfig[role];

  const handlePress = async (item: DrawerItem) => {
    if (item.actionType === "logout") {
      props.navigation.closeDrawer();
      await clearSession();
      router.replace("/(auth)/login" as any);
    } else if (item.route) {
      props.navigation.closeDrawer();
      router.push(item.route as any);
    }
  };

  const getSegment = (route?: string) =>
    route?.split("/").filter(Boolean).pop() ?? "";

  const name = session?.profile?.name || "User";
  const email = session?.profile?.email || "";

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.white} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {!!email && (
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        )}
        <Text style={styles.roleLabel}>
          {role === "company" ? "Company Admin" : "Employee"}
        </Text>
      </View>

      {/* Nav Items */}
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        {config.drawer.map((item, index) => {
          const active = item.route
            ? pathname.endsWith(getSegment(item.route)) ||
              (getSegment(item.route) === "" && pathname.split("/").length <= 2)
            : false;
          const isLogout = item.actionType === "logout";
          return (
            <TouchableOpacity
              key={index}
              style={[styles.item, active && !isLogout && styles.activeItem]}
              onPress={() => handlePress(item)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={
                  isLogout
                    ? colors.danger
                    : active
                      ? colors.primary
                      : colors.text
                }
              />
              <Text
                style={[
                  styles.label,
                  active && !isLogout && styles.activeLabel,
                  isLogout && styles.logoutLabel,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 32,
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  email: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "400",
  },
  roleLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    marginTop: 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
    gap: 14,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  activeItem: {
    backgroundColor: `${colors.primary}18`,
  },
  label: {
    fontSize: 15,
    color: colors.text,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: "600",
  },
  logoutLabel: {
    color: colors.danger,
  },
});
