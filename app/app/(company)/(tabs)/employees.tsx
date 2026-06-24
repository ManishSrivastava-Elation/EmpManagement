// app/(company)/(tabs)/employees.tsx
import EmployeeCard from "@/components/company/employees/EmployeeCard";
import { EmployeeApiItem, EmployeeStatus } from "@/components/company/employees/types";
import {
  getEmployees,
  updateEmployeeStatus,
  type EmployeeMeta,
  type EmployeeFilters,
} from "@/services/company/employees/employee.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const LIMIT = 10;
const EMPTY_META: EmployeeMeta = { page: 1, limit: LIMIT, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false };

export default function EmployeesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<EmployeeApiItem[]>([]);
  const [meta, setMeta] = useState<EmployeeMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const buildFilters = useCallback((page: number): EmployeeFilters => {
    const f: EmployeeFilters = { page, limit: LIMIT };
    if (debouncedSearch.trim()) f.search = debouncedSearch.trim();
    return f;
  }, [debouncedSearch]);

  const load = useCallback(async (page: number, append = false) => {
    if (page === 1) append ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getEmployees(buildFilters(page));
      setEmployees(prev => append && page > 1 ? [...prev, ...(res.data ?? [])] : (res.data ?? []));
      setMeta(res.meta ?? EMPTY_META);
    } catch (err) {
      console.error("load employees error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [buildFilters]);

  useEffect(() => { load(1, false); }, [debouncedSearch]);

  useFocusEffect(useCallback(() => { load(1, false); }, [debouncedSearch]));

  const onRefresh = useCallback(() => load(1, false), [load]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && !loading && meta.hasNextPage) {
      load(meta.page + 1, true);
    }
  }, [loadingMore, loading, meta, load]);

  const handleStatusChange = useCallback(async (employee: EmployeeApiItem, newStatus: EmployeeStatus) => {
    setEmployees(prev => prev.map(e => e.employee_id === employee.employee_id ? { ...e, status: newStatus } : e));
    try {
      await updateEmployeeStatus(employee.employee_id, newStatus);
    } catch (err) {
      setEmployees(prev => prev.map(e => e.employee_id === employee.employee_id ? employee : e));
      console.error("Failed to update status", err);
    }
  }, []);

  const keyExtractor = useCallback((item: EmployeeApiItem) => item.employee_id.toString(), []);

  const renderItem = useCallback(({ item }: { item: EmployeeApiItem }) => (
    <EmployeeCard employee={item} onStatusChange={handleStatusChange} />
  ), [handleStatusChange]);

  const ListHeader = useMemo(() => (
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
    </View>
  ), [searchQuery]);

  const ListEmpty = useMemo(() => (
    loading ? null : (
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={36} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No employees found</Text>
        <Text style={styles.emptySubtitle}>Try a different search term.</Text>
      </View>
    )
  ), [loading]);

  const ListFooter = useMemo(() => (
    loadingMore ? (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    ) : !meta.hasNextPage && employees.length > 0 ? (
      <View style={styles.footer}>
        <Text style={styles.footerText}>No more employees</Text>
      </View>
    ) : null
  ), [loadingMore, meta.hasNextPage, employees.length]);

  return (
    <View style={styles.safeArea}>
      {loading && !refreshing && (
        <ActivityIndicator style={styles.loadingOverlay} color="#3B82F6" />
      )}
      <FlatList
        data={employees}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAFAFB", marginTop: 10 },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 0, paddingBottom: 16,
  },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e7eb",
    borderRadius: 8, paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, fontSize: 14.5, color: "#111827", padding: 0 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#374151", marginTop: 6 },
  emptySubtitle: { fontSize: 13, color: "#9ca3af" },
  footer: { alignItems: "center", paddingVertical: 16 },
  footerText: { color: "#9ca3af", fontSize: 12 },
  loadingOverlay: { marginTop: 40 },
});
