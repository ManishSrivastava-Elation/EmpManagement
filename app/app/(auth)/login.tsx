import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import LoginHeader from "@/components/auth/login/LoginHeader";
import LoginForm from "@/components/auth/login/LoginForm";
import { theme } from "@/theme";
import { companyLogin } from "@/services/company.service";
import { employeeLogin } from "@/services/employee.service";

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
      const response =
        data.userType === "company"
          ? await companyLogin(data.identifier, data.password)
          : await employeeLogin(data.identifier, data.password);
      if (response) {
        Alert.alert("Login Successful");
      }
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
