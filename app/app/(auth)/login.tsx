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

const { colors, spacing } = theme;

export default function Login() {
  const [isLoading, setIsLoading] =
    useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      await new Promise((r) =>
        setTimeout(r, 1000)
      );

      Alert.alert("Login Successful");
    } catch {
      Alert.alert(
        "Error",
        "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={false}
        >
          <LoginHeader />

          <LoginForm
            isLoading={isLoading}
            onLogin={handleLogin}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      colors.background,
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