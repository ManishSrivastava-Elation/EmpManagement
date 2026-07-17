import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { ProfileSkeleton } from "@/components/employee/skeleton";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import {
  getEmployeeProfile,
  EmployeeProfile,
} from "@/services/auth/employee.service";
import { clearSession } from "@/services/storage.service";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch employee profile on screen focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchProfile = async () => {
        try {
          setIsLoading(true);
          const res = await getEmployeeProfile();
          if (isMounted && res.success) {
            setProfile(res.data);
          }
        } catch (err: any) {
          console.error("Failed to load profile details", err);
          if (isMounted) {
            Alert.alert(
              "Error",
              err?.response?.data?.message ||
                "Failed to fetch profile details. Please try again.",
            );
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchProfile();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const handleEditProfile = () => {
    if (!profile) return;
    router.push({
      pathname: "/(employee)/edit-profile",
      params: { profile: JSON.stringify(profile) },
    });
  };

  const handleUpdatePassword = () => {
    router.push("/(employee)/update-password");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await clearSession();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const formatJoinedDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {isLoading ? (
        <ProfileSkeleton />
      ) : profile ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile card */}
          <View style={[styles.card, styles.profileCard]}>
            <View style={styles.avatarWrap}>
              {/* <Image
                source={{
                  uri:
                    profile.profile_image || "https://img.icons8.com/?size=100&id=NcQNyxjmHvuB&format=png&color=000000",
                }}
                style={styles.avatar}
              /> */}
              {profile.profile_image ? (
                <Image
                  source={{
                    uri:
                      profile.profile_image ||
                      "https://img.icons8.com/?size=100&id=NcQNyxjmHvuB&format=png&color=000000",
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={55} color="#FFFFFF" />
                </View>
              )}
              {/* <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </View> */}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.name}</Text>
              {/* <View style={styles.empBadge}>
                <Text style={styles.empBadgeText}>{profile.employee_code}</Text>
              </View> */}
              <View style={styles.inlineRow}>
                <Ionicons
                  name="briefcase-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.companyText}>{profile.company_name}</Text>
              </View>
            </View>
          </View>

          {/* Profile details */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.cardTitle}>Profile details</Text>
            </View>
            <View style={styles.divider} />

            {/* Email */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Phone */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{profile.phone}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Created At */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Created At</Text>
                <Text style={styles.infoValue}>
                  {formatJoinedDate(profile.created_at)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Updated At */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Updated At</Text>
                <Text style={styles.infoValue}>
                  {formatJoinedDate(profile.updated_at)}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="flash-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Quick actions</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={handleEditProfile}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.actionLabel}>Edit profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={handleUpdatePassword}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.actionLabel}>Update password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={handleLogout}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.actionLabel}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.dangerText}
          />
          <Text style={styles.errorText}>Could not load profile info</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ---- Theme ----
const colors = {
  bg: "#F3F5F9",
  card: "#FFFFFF",
  primary: "#2F5FE0",
  primaryDark: "#1C46C9",
  textPrimary: "#1B1F2A",
  textSecondary: "#6B7280",
  border: "#EEF0F4",
  badgeBg: "#EAF0FE",
  badgeText: "#2F5FE0",
  successBg: "#E5F6EA",
  successText: "#1E8E3E",
  warningBg: "#FFF1DC",
  warningText: "#C97A0E",
  dangerText: "#D6573C",
  iconCircleBg: "#EEF2FB",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 6,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#0B1A3A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 1,
  },
  profileCard: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    alignItems: "center",
    width: "100%",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  empBadge: {
    backgroundColor: colors.badgeBg,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  empBadgeText: {
    color: colors.badgeText,
    fontSize: 13,
    fontWeight: "600",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  companyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.iconCircleBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  infoValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
  },
});
