// app/employees/index.tsx
import EmployeeCard from "@/components/company/employees/EmployeeCard";
import {
  Employee,
  EmployeeApiItem,
  EmployeeStatus,
} from "@/components/company/employees/types";
import { getEmployees, updateEmployeeStatus } from "@/services/company/employees/employee.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function EmployeesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<EmployeeApiItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchEmployees = async () => {
        setLoading(true);

        try {
          const res = await getEmployees();

          if (!cancelled) {
            setEmployees(res.data);
          }
        } catch (err) {
          if (!cancelled) {
            console.error(err);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      fetchEmployees();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        e.employee_code.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q),
    );
  }, [employees, searchQuery]);

  const handleStatusChange = useCallback(async (employee: EmployeeApiItem, newStatus: EmployeeStatus) => {
    // optimistic UI update
    setEmployees(prev => prev.map(e => e.employee_id === employee.employee_id ? { ...e, status: newStatus } : e));

    try {
      await updateEmployeeStatus(employee.employee_id, newStatus);
    } catch (err) {
      // rollback on error
      setEmployees(prev => prev.map(e => e.employee_id === employee.employee_id ? employee : e));
      console.error('Failed to update status', err);
    }
  }, []);

  const handleOpenMenu = useCallback(() => {
    // Wire up to your drawer navigator, e.g. navigation.openDrawer()
  }, []);

  const handleOpenFilter = useCallback(() => {
    // Wire up to your filter sheet/modal
  }, []);

  const handleSort = useCallback(() => {
    // Wire up to your sort sheet/modal
  }, []);

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Pressable
          onPress={handleOpenMenu}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={8}
        >
          <Ionicons name="menu" size={24} color="#111827" />
        </Pressable>

        <Text style={styles.headerTitle}>Employees</Text>

        <Pressable
          onPress={handleOpenFilter}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Filter employees"
          hitSlop={8}
        >
          <Ionicons name="filter-outline" size={22} color="#111827" />
        </Pressable>
      </View> */}

      {/* Search + Sort */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            accessibilityLabel="Search employees"
          />
        </View>

        {/* <Pressable
          onPress={handleSort}
          style={({ pressed }) => [styles.sortButton, pressed ? styles.sortButtonPressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Sort employees"
        >
          <Ionicons name="swap-vertical" size={16} color="#4b5563" />
          <Text style={styles.sortText}>Sort</Text>
        </Pressable> */}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#3B82F6" />
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.employee_id.toString()}
          renderItem={({ item }) => (
            <EmployeeCard employee={item} onStatusChange={handleStatusChange} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={36} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No employees found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search term.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFB",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: "#111827",
    padding: 0,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  sortButtonPressed: {
    backgroundColor: "#f9fafb",
  },
  sortText: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#4b5563",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#9ca3af",
  },
});
