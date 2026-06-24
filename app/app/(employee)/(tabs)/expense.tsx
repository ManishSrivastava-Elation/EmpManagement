// app/(employee)/(tabs)/expense.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '@/theme';
import { toYMD } from '@/utils/timeHelpers';
import { fmtDate } from '@/utils/attendanceHelpers';
import {
  getExpenses,
  type ApiExpense,
  type ExpenseMeta,
  type ExpenseFilters,
  type ExpenseStatus,
} from '@/services/employees/expense.service';
import ExpenseCard from '@/components/expense/ExpenseCard';
import ExpenseFilter from '@/components/expense/ExpenseFilter';
import StatCard from '@/components/common/StatCard';
import MonthNavigator from '@/components/common/MonthNavigator';
import DateRangeModal from '@/components/employees/attendance_list/DateRangeModal';
import AddExpenseModal from '@/components/employees/expense/AddExpenseModal';
import { createExpense } from '@/services/employees/expense.service';
import { Alert } from 'react-native';

const LIMIT = 10;

type FilterStatus = 'all' | ExpenseStatus;

const EMPTY_META: ExpenseMeta = { page: 1, limit: LIMIT, total: 0, totalPages: 0, hasNextPage: false, pending: 0, approved: 0, rejected: 0 };

export default function ExpenseScreen() {
  const today = new Date();

  // Filter state
  const [status, setStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());

  // Month navigator state
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const isFutureMonth = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth());
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isFutureMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Data state
  const [data, setData] = useState<ApiExpense[]>([]);
  const [meta, setMeta] = useState<ExpenseMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // UI state
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const buildFilters = useCallback((page: number): ExpenseFilters => {
    const f: ExpenseFilters = { page, limit: LIMIT };
    if (status !== 'all') f.status = status;
    if (debouncedSearch.trim()) f.search = debouncedSearch.trim();
    if (rangeStart && rangeEnd) {
      f.startDate = toYMD(rangeStart);
      f.endDate = toYMD(rangeEnd);
    } else {
      f.startDate = toYMD(new Date(viewYear, viewMonth, 1));
      f.endDate = toYMD(new Date(viewYear, viewMonth + 1, 0));
    }
    return f;
  }, [status, debouncedSearch, rangeStart, rangeEnd, viewMonth, viewYear]);

  const load = useCallback(async (page: number, append = false) => {
    if (page === 1) append ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getExpenses(buildFilters(page));
      setData(prev => append && page > 1 ? [...prev, ...(res.data ?? [])] : (res.data ?? []));
      setMeta(res.meta ?? EMPTY_META);
    } catch (e) {
      console.log('load expenses error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [buildFilters]);

  useEffect(() => { load(1, false); }, [status, debouncedSearch, rangeStart, rangeEnd, viewMonth, viewYear]);

  useFocusEffect(useCallback(() => { load(1, false); }, [viewMonth, viewYear, rangeStart, rangeEnd, status, debouncedSearch]));

  const onRefresh = useCallback(() => load(1, false), [load]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && !loading && meta.hasNextPage) {
      load(meta.page + 1, true);
    }
  }, [loadingMore, loading, meta, load]);

  // Range picker handlers
  const openPicker = () => {
    setPickerYear(today.getFullYear());
    setPickerMonth(today.getMonth());
    setPickingEnd(false);
    setShowRangePicker(true);
  };
  const handlePickerDay = useCallback((d: Date) => {
    if (!pickingEnd) {
      setRangeStart(d); setRangeEnd(null); setPickingEnd(true);
    } else {
      if (rangeStart && d < rangeStart) { setRangeEnd(rangeStart); setRangeStart(d); }
      else setRangeEnd(d);
      setPickingEnd(false);
    }
  }, [pickingEnd, rangeStart]);
  const applyRange = () => { if (rangeStart && rangeEnd) setShowRangePicker(false); };
  const clearRange = () => { setRangeStart(null); setRangeEnd(null); setPickingEnd(false); };
  const selectThisMonth = () => {
    setRangeStart(new Date(today.getFullYear(), today.getMonth(), 1));
    setRangeEnd(today); setPickingEnd(false); setShowRangePicker(false);
  };
  const selectLast7Days = () => {
    const s = new Date(today); s.setDate(s.getDate() - 6);
    setRangeStart(s); setRangeEnd(today); setPickingEnd(false); setShowRangePicker(false);
  };
  const selectLast30Days = () => {
    const s = new Date(today); s.setDate(s.getDate() - 29);
    setRangeStart(s); setRangeEnd(today); setPickingEnd(false); setShowRangePicker(false);
  };

  const handleAddExpense = async (formData: {
    type: string; description: string; amount: number; hasBill: boolean;
    billFile: { uri: string; name: string; type: string } | null;
  }) => {
    try {
      await createExpense({
        title: formData.type, description: formData.description,
        amount: formData.amount, expenseDate: new Date().toISOString().split('T')[0],
        receiptFile: formData.billFile,
      });
      Alert.alert('Success', 'Expense added successfully!');
      load(1, false);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add expense');
    }
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (status !== 'all') n++;
    if (debouncedSearch.trim()) n++;
    if (rangeStart || rangeEnd) n++;
    return n;
  }, [status, debouncedSearch, rangeStart, rangeEnd]);

  const renderItem = useCallback(({ item }: { item: ApiExpense }) => (
    <ExpenseCard item={item} />
  ), []);

  const keyExtractor = useCallback((item: ApiExpense) => String(item.ExpenseId), []);

  const ListHeader = useMemo(() => (
    <View style={{ paddingTop: 12 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Expenses</Text>
          <Text style={styles.headerSub}>Your expense history</Text>
        </View>
        <View style={styles.headerRight}>
          {/* {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )} */}
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={22} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Month Navigator */}
      <MonthNavigator
        month={viewMonth}
        year={viewYear}
        onPrev={prevMonth}
        onNext={nextMonth}
        disableNext={isFutureMonth}
      />

      {/* Stat Cards */}
      <View style={styles.statsRow}>
        <StatCard label="All" count={meta.total} color={theme.colors.primary} icon="receipt" active={status === 'all'} onPress={() => setStatus('all')} />
        <StatCard label="Pending" count={meta.pending} color="#f59e0b" icon="clock-outline" active={status === 'pending'} onPress={() => setStatus('pending')} />
        <StatCard label="Approved" count={meta.approved} color="#22c55e" icon="check-circle" active={status === 'approved'} onPress={() => setStatus('approved')} />
        <StatCard label="Rejected" count={meta.rejected} color="#ef4444" icon="close-circle" active={status === 'rejected'} onPress={() => setStatus('rejected')} />
      </View>

      {/* Filters */}
      <ExpenseFilter
        search={search}
        onSearchChange={setSearch}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onOpenRangePicker={openPicker}
        onClearRange={clearRange}
      />

      <Text style={styles.listTitle}>{meta.total} Records</Text>
    </View>
  ), [meta, status, search, rangeStart, rangeEnd, activeFilterCount]);

  const ListEmpty = useMemo(() => (
    loading ? null : (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No expenses found</Text>
      </View>
    )
  ), [loading]);

  const ListFooter = useMemo(() => (
    loadingMore ? (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    ) : !meta.hasNextPage && data.length > 0 ? (
      <View style={styles.footer}>
        <Text style={styles.footerText}>No more expenses</Text>
      </View>
    ) : null
  ), [loadingMore, meta.hasNextPage, data.length]);

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={styles.root}>
      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
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

      <DateRangeModal
        visible={showRangePicker}
        onClose={() => setShowRangePicker(false)}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        pickingEnd={pickingEnd}
        pickerYear={pickerYear}
        pickerMonth={pickerMonth}
        onPickerYearMonthChange={(y, m) => { setPickerYear(y); setPickerMonth(m); }}
        onDayPress={handlePickerDay}
        onClearRange={clearRange}
        onApply={applyRange}
        today={today}
        onThisMonth={selectThisMonth}
        onLast7Days={selectLast7Days}
        onLast30Days={selectLast30Days}
      />

      <AddExpenseModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddExpense={handleAddExpense}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  headerSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  filterBadge: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#ef4444',
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  listTitle: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14 },
  footer: { alignItems: 'center', paddingVertical: 16 },
  footerText: { color: theme.colors.textSecondary, fontSize: 12 },
  loadingOverlay: { position: 'absolute', top: 12, right: 20, zIndex: 10 },
});
