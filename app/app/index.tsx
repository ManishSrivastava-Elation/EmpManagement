import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { getToken, getRole } from "@/services/storage.service";
import { theme } from "@/theme";

export default function Index() {
  const [state, setState] = useState<{
    loading: boolean;
    redirect: string;
  }>({ loading: true, redirect: "/(auth)/login" });

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const role = await getRole();
      if (token && role === "company") {
        setState({ loading: false, redirect: "/(company)/(tabs)" });
      } else if (token && role === "employee") {
        setState({ loading: false, redirect: "/(employee)/(tabs)" });
      } else {
        setState({ loading: false, redirect: "/(auth)/login" });
      }
    })();
  }, []);

  if (state.loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <Redirect href={state.redirect as any} />;
}
