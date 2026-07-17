import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

import LoginForm from "@/components/auth/login/LoginForm";
import LoginHeader from "@/components/auth/login/LoginHeader";
import { companyLogin } from "@/services/auth/company.service";
import { employeeLogin } from "@/services/auth/employee.service";
import { saveSession } from "@/services/storage.service";
import { theme } from "@/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "@/components/common/Footer";

const { colors, spacing } = theme;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const navigateToVerifyAccount = (payload: {
    email?: string;
    phone?: string;
    userId?: string | number;
    entity_type?: string;
  }) => {
    router.push({
      pathname: "/(auth)/verify-account",
      params: {
        email: payload.email ?? "",
        phone: payload.phone ?? "",
        userId: payload.userId ? String(payload.userId) : "",
        entity_type: payload.entity_type ?? "employee",
      },
    });
  };

  const handleLogin = async (data: {
    userType: string | number | null;
    identifier: string;
    password: string;
  }) => {
    setIsLoading(true);
    const isCompany = data.userType === "company";
    try {
      const response = isCompany
        ? await companyLogin(data.identifier, data.password)
        : await employeeLogin(data.identifier, data.password);

      const { token } = response?.data;
      const role = isCompany ? "company" : "employee";

      const profile = isCompany
        ? {
            name: response?.data?.company?.company_name ?? "",
            email: response?.data?.company?.email ?? "",
          }
        : {
            name: response?.data?.employee?.FullName ?? "",
            email: response?.data?.employee?.Email ?? "",
          };

      await saveSession({ token, role, profile });
      router.replace(isCompany ? "/(company)/(tabs)" : "/(employee)/(tabs)");
    } catch (err: any) {
      const errorResponse = err?.response?.data;
      const verificationData =
        errorResponse?.data?.employee ?? errorResponse?.data?.company;
      if (
        err?.response?.status === 403 &&
        errorResponse?.message ===
          "Please verify email or mobile before login" &&
        verificationData
      ) {
        navigateToVerifyAccount({
          email: verificationData?.email ?? verificationData?.Email,
          phone: verificationData?.mobile ?? verificationData?.MobileNo,
          userId: verificationData?.EmployeeId ?? verificationData?.CompanyId,
          entity_type: isCompany ? "company" : "employee",
        });
        return;
      }

      Alert.alert("Error", errorResponse?.message || "Something went wrong");
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
      <Footer />
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
