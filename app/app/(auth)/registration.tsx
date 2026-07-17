import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "@/components/common/PrimaryButton";
import { theme } from "@/theme";
import Footer from "@/components/common/Footer";

const { colors, spacing, fontSize, fontWeight, radius } = theme;

const ROLES = [
  {
    label: "Company",
    icon: "business-outline" as const,
    desc: "Manage your team, attendance & expenses",
    route: "/(auth)/companyRegistration",
  },
  {
    label: "Employee",
    icon: "person-outline" as const,
    desc: "Track your work, attendance & expenses",
    route: "/(auth)/employeeRegistration",
  },
];

export default function Registration() {
  const [selected, setSelected] = useState("");
  const router = useRouter();

  const selectedRole = ROLES.find((r) => r.label === selected);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logo}>EM</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Choose your account type to get started</Text>
        </View>

        {/* Role Cards */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>I am joining as</Text>

          <View style={styles.grid}>
            {ROLES.map((role) => {
              const isSelected = selected === role.label;
              return (
                <TouchableOpacity
                  key={role.label}
                  style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                  onPress={() => setSelected(role.label)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color={colors.white} />
                    </View>
                  )}
                  <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                    <Ionicons
                      name={role.icon}
                      size={28}
                      color={isSelected ? colors.white : colors.primary}
                    />
                  </View>
                  <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>
                    {role.label}
                  </Text>
                  <Text style={[styles.roleDesc, isSelected && styles.roleDescSelected]}>
                    {role.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <PrimaryButton
            label={selected ? `Continue as ${selected}` : "Select a role to continue"}
            onPress={() => selectedRole && router.push(selectedRole.route as any)}
            disabled={!selected}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    position: "relative",
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  checkBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}12`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  iconWrapperSelected: {
    backgroundColor: colors.primary,
  },
  roleLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 4,
  },
  roleLabelSelected: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  roleDescSelected: {
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});
