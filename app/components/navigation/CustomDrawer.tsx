import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { clearAuth, getRole, getUser } from '../../services/storage.service';
import { roleConfig, type RoleType, type DrawerItem } from '../../utils/roleConfig';
import { colors } from '../../theme/colors';

export default function CustomDrawer(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<RoleType>('employee');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([getRole(), getUser()]).then(([r, u]) => {
      setRole((r as RoleType) || 'employee');
      setUser(u);
    });
  }, []);

  const config = roleConfig[role];

  const handlePress = async (item: DrawerItem) => {
    if (item.actionType === 'logout') {
      props.navigation.closeDrawer();
      await clearAuth();
      router.replace('/(auth)/login' as any);
    } else if (item.route) {
      props.navigation.closeDrawer();
      router.push(item.route as any);
    }
  };

  const getSegment = (route?: string) => route?.split('/').filter(Boolean).pop() || '';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.white} />
        </View>
        <Text style={styles.name}>{user?.name || user?.companyName || 'User'}</Text>
        <Text style={styles.roleLabel}>{role === 'company' ? 'Company Admin' : 'Employee'}</Text>
      </View>

      {/* Nav Items */}
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        {config.drawer.map((item, index) => {
          const active = item.route ? pathname.endsWith(getSegment(item.route)) || (getSegment(item.route) === '' && pathname.split('/').length <= 2) : false;
          const isLogout = item.actionType === 'logout';
          return (
            <TouchableOpacity
              key={index}
              style={[styles.item, active && !isLogout && styles.activeItem]}
              onPress={() => handlePress(item)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isLogout ? colors.danger : active ? colors.primary : colors.text}
              />
              <Text style={[styles.label, active && !isLogout && styles.activeLabel, isLogout && styles.logoutLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>
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
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  roleLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  logoutLabel: {
    color: colors.danger,
  },
});
