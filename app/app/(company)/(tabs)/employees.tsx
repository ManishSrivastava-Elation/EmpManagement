// app/(company)/(tabs)/employees.tsx
import EmployeeCard from "@/components/company/employees/EmployeeCard";
import { EmployeeApiItem, EmployeeStatus } from "@/components/company/employees/types";
import {
  getEmployees,
  updateEmployeeStatus,
  verifyEmployee,
  type EmployeeMeta,
  type EmployeeFilters,
} from "@/services/company/employees/employee.service";
import { EmployeesSkeleton } from "@/components/common/SkeletonLoader";
import NoActiveSubscription from "@/components/common/NoActiveSubscription";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { JobSearchBar } from '@/components/company/jobs';
import CompanyFilterSheet from '@/components/company/common/CompanyFilterSheet';
import { theme } from '@/theme';

const LIMIT = 10;
const EMPTY_META: EmployeeMeta = { page: 1, limit: LIMIT, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false };



export default function EmployeesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<EmployeeApiItem[]>([]);
  const [meta, setMeta] = useState<EmployeeMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [noSubscription, setNoSubscription] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>('');
  const [draftStatus, setDraftStatus] = useState<string>('');
  const [activeSortBy, setActiveSortBy] = useState<'created_at' | 'full_name' | 'status' | 'employee_code'>('created_at');
  const [activeOrder, setActiveOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [draftSortBy, setDraftSortBy] = useState<'created_at' | 'full_name' | 'status' | 'employee_code'>('created_at');
  const [draftOrder, setDraftOrder] = useState<'ASC' | 'DESC'>('DESC');

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
    if (activeStatus) f.status = activeStatus;
    f.sortBy = activeSortBy;
    f.order = activeOrder;
    return f;
  }, [debouncedSearch, activeStatus, activeSortBy, activeOrder]);

  const load = useCallback(async (page: number, append = false) => {
    if (page === 1) append ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getEmployees(buildFilters(page));
      if ((res as any)?.statusCode === 403 && (res as any)?.message === 'No active subscription found') {
        setNoSubscription(true);
        return;
      }
      setNoSubscription(false);
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

  useEffect(() => { load(1, false); }, [debouncedSearch, activeStatus, activeSortBy, activeOrder]);

  useFocusEffect(useCallback(() => { load(1, false); }, [debouncedSearch, activeStatus, activeSortBy, activeOrder]));

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

  const handleVerify = useCallback(async (employee: EmployeeApiItem) => {
    try {
      await verifyEmployee(employee.employee_id);
      setEmployees(prev =>
        prev.map(e => e.employee_id === employee.employee_id ? { ...e, emp_verified: 1 } : e)
      );
      Alert.alert("Success", "Employee verified successfully");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to verify employee");
      throw err;
    }
  }, []);

  const keyExtractor = useCallback((item: EmployeeApiItem) => item.employee_id.toString(), []);

  const renderItem = useCallback(({ item }: { item: EmployeeApiItem }) => (
    <EmployeeCard employee={item} onStatusChange={handleStatusChange} onVerify={handleVerify} />
  ), [handleStatusChange, handleVerify]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch.trim()) count += 1;
    if (activeStatus) count += 1;
    if (activeSortBy !== 'created_at' || activeOrder !== 'DESC') count += 1;
    return count;
  }, [debouncedSearch, activeStatus, activeSortBy, activeOrder]);

  const openFilter = useCallback(() => {
    setDraftStatus(activeStatus);
    setDraftSortBy(activeSortBy);
    setDraftOrder(activeOrder);
    setFilterVisible(true);
  }, [activeStatus, activeSortBy, activeOrder]);

  const applyFilter = useCallback(() => {
    setActiveStatus(draftStatus);
    setActiveSortBy(draftSortBy);
    setActiveOrder(draftOrder);
    setFilterVisible(false);
  }, [draftStatus, draftSortBy, draftOrder]);

  const resetFilter = useCallback(() => {
    setDraftStatus('');
    setDraftSortBy('created_at');
    setDraftOrder('DESC');
    setActiveStatus('');
    setActiveSortBy('created_at');
    setActiveOrder('DESC');
    setFilterVisible(false);
  }, []);

  const ListHeader = useMemo(() => (
    <JobSearchBar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onClearSearch={() => setSearchQuery('')}
      activeFilterCount={activeFilterCount}
      totalJobs={meta.total}
      onOpenFilter={openFilter}
    />
  ), [searchQuery, activeFilterCount, meta.total, openFilter]);

  const ListEmpty = useMemo(() => (
    loading ? null : (
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={36} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No employees found</Text>
        <Text style={styles.emptySubtitle}>Try a different search term or filter.</Text>
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

  if (loading && !refreshing) return <EmployeesSkeleton />;

  if (noSubscription) return <NoActiveSubscription />;

  return (
    <View style={styles.safeArea}>
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

      <CompanyFilterSheet
        visible={filterVisible}
        title="Filters"
        onCancel={() => setFilterVisible(false)}
        onReset={resetFilter}
        onApply={applyFilter}
        hasActiveFilters={activeFilterCount > 0}
      >
        <Text style={styles.label}>Status</Text>
        <View style={styles.chipRow}>
          {[
            { label: 'All', value: '' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, draftStatus === option.value && styles.chipActive]}
              onPress={() => setDraftStatus(option.value)}
            >
              <Text style={[styles.chipText, draftStatus === option.value && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Sort By</Text>
        <View style={styles.chipRow}>
          {[
            { label: 'Created Date', value: 'created_at' },
            { label: 'Name', value: 'full_name' },
            { label: 'Status', value: 'status' },
            { label: 'Employee Code', value: 'employee_code' },
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, draftSortBy === option.value && styles.chipActive]}
              onPress={() => setDraftSortBy(option.value as 'created_at' | 'full_name' | 'status' | 'employee_code')}
            >
              <Text style={[styles.chipText, draftSortBy === option.value && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Order</Text>
        <View style={styles.chipRow}>
          {[
            { label: 'Ascending', value: 'ASC' },
            { label: 'Descending', value: 'DESC' },
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, draftOrder === option.value && styles.chipActive]}
              onPress={() => setDraftOrder(option.value as 'ASC' | 'DESC')}
            >
              <Text style={[styles.chipText, draftOrder === option.value && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </CompanyFilterSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background, marginTop: 10 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#374151", marginTop: 6 },
  emptySubtitle: { fontSize: 13, color: "#9ca3af" },
  footer: { alignItems: "center", paddingVertical: 16 },
  footerText: { color: "#9ca3af", fontSize: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  chipActive: { backgroundColor: '#1B2E6F', borderColor: '#1B2E6F' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});
