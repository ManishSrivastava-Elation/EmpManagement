import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export default function Footer() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Powered by Vishvajeet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10, alignItems: "center", backgroundColor: colors.gray },
  text: { fontSize: 12, color: colors.text },
});
