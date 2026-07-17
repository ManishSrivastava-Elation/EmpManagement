// components/expense/ExpenseFilter.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "@/theme";
import { fmtDate } from "@/utils/attendanceHelpers";

interface ExpenseFilterProps {
  search: string;
  onSearchChange: (v: string) => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onOpenRangePicker: () => void;
  onClearRange: () => void;
}

export default function ExpenseFilter({
  search,
  onSearchChange,
  rangeStart,
  rangeEnd,
  onOpenRangePicker,
  onClearRange,
}: ExpenseFilterProps) {
  const rangeActive = !!(rangeStart && rangeEnd);

  return (
    <View style={styles.container}>
      {/* Search + Date Range in one row */}
      <View style={styles.row}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={15}
            color={theme.colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search..."
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="search"
          />
          {!!search && (
            <TouchableOpacity
              onPress={() => onSearchChange("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close-circle"
                size={15}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={onOpenRangePicker}
          style={[styles.rangeBtn, rangeActive && styles.rangeBtnActive]}
        >
          <MaterialCommunityIcons
            name="calendar-range"
            size={15}
            color={rangeActive ? theme.colors.white : theme.colors.primary}
          />
          <Text>Date Range</Text>
          {rangeActive && (
            <>
              <Text style={styles.rangeBtnText} numberOfLines={1}>
                {`${fmtDate(rangeStart!)} → ${fmtDate(rangeEnd!)}`}
              </Text>
              <TouchableOpacity
                onPress={onClearRange}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={14}
                  color="rgba(255,255,255,0.8)"
                />
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: theme.colors.text, padding: 0 },
  rangeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rangeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rangeBtnText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "600",
    maxWidth: 130,
  },
});
