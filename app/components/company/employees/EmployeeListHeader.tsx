// components/company/employees/EmployeeListHeader.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

// ─── Component ────────────────────────────────────────────────────────────────
// No "Add Employee" button — company module is read-only for employee listing.

const EmployeeListHeader: React.FC = () => {
  return (
    <View style={styles.topBar}>
      <Text style={styles.heading}>Manage Employees</Text>
    </View>
  );
};

export default EmployeeListHeader;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
});
