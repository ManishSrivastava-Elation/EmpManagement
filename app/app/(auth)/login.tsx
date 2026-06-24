import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";

import LoginHeader from "@/components/auth/login/LoginHeader";
import LoginForm from "@/components/auth/login/LoginForm";
import { theme } from "@/theme";
import { companyLogin } from "@/services/auth/company.service";
import { employeeLogin } from "@/services/auth/employee.service";
import { saveSession } from "@/services/storage.service";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, spacing } = theme;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: {
    userType: string | number | null;
    identifier: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const isCompany = data.userType === "company";
console.log(isCompany);

      const response = isCompany
        ? await companyLogin(data.identifier, data.password)
        : await employeeLogin(data.identifier, data.password);

      

      const { token } = response?.data;
      const role = isCompany ? 'company' : 'employee';

      const profile = isCompany
        ? { name: response?.data?.company?.company_name ?? '', email: response?.data?.company?.email ?? '' }
        : { name: response?.data?.employee?.FullName ?? '', email: response?.data?.employee?.Email ?? '' };

      await saveSession({ token, role, profile });
      router.replace((isCompany ? '/(company)' : '/(employee)') as any);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Something went wrong. Please try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <LoginHeader />
          <LoginForm isLoading={isLoading} onLogin={handleLogin} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
});
