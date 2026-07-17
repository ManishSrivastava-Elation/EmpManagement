// app/(company)/(tabs)/expense.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ExpenseSkeleton } from '@/components/common/SkeletonLoader';
import NoActiveSubscription from '@/components/common/NoActiveSubscription';
import HeaderActionButton from '@/components/common/HeaderActionButton';
import ReportModal from '@/components/report/ReportModal';
import { shareExpenseReport } from '@/services/company/report.service';
import { theme } from '@/theme';
import { toYMD } from '@/utils/timeHelpers';
import {
  getExpenses,
  createExpense,
  type ApiExpense,
  type ExpenseMeta,
  type ExpenseFilters,
  type ExpenseStatus,
} from '@/services/company/expense.service';
import ExpenseCard from '@/components/company/expense/ExpenseCard';
import StatCard from '@/components/common/StatCard';
import MonthNavigator from '@/components/common/MonthNavigator';
import DateRangeModal from '@/components/employees/attendance_list/DateRangeModal';
import { AddExpenseModal } from '@/components/company/expense';
import CompanyFilterSheet from '@/components/company/common/CompanyFilterSheet';
import { JobSearchBar } from '@/components/company/jobs';
import SearchableSelect from '@/components/common/SearchableSelect';
import { getEmployeeOptions } from '@/services/company/job.service';

const LIMIT = 10;
type FilterStatus = 'all' | ExpenseStatus;
const EMPTY_META: ExpenseMeta = { page: 1, limit: LIMIT, total: 0, totalPages: 0, hasNextPage: false, pending: 0, approved: 0, rejected: 0, paid: 0 };


export default function CompanyExpenseScreen() {
  const today = new Date();
  const navigation = useNavigation();
  const drawerNavigation = navigation.getParent();

  const [showReport, setShowReport] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      drawerNavigation?.setOptions({
        headerRight: () => (
          <HeaderActionButton
            visible={true}
            title="Share Report"
            onPress={() => setShowReport(true)}
          />
        ),
      });
      return () => drawerNavigation?.setOptions({ headerRight: undefined });
    }, [drawerNavigation]),
  );

  // Filter state
  const [status, setStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [draftStatus, setDraftStatus] = useState<FilterStatus>('all');
  const [draftEmployeeId, setDraftEmployeeId] = useState<number | null>(null);
  const [draftEmployeeName, setDraftEmployeeName] = useState('');
  const [activeEmployeeId, setActiveEmployeeId] = useState<number | null>(null);
  const [activeEmployeeName, setActiveEmployeeName] = useState('');
  const [activeSortBy, setActiveSortBy] = useState<'ExpenseDate' | 'Amount' | 'Status' | 'EmployeeName'>('ExpenseDate');
  const [activeOrder, setActiveOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [draftSortBy, setDraftSortBy] = useState<'ExpenseDate' | 'Amount' | 'Status' | 'EmployeeName'>('ExpenseDate');
  const [draftOrder, setDraftOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const [employeeOptions, setEmployeeOptions] = useState<Array<{label: string; value: number}>>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
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
  const [noSubscription, setNoSubscription] = useState(false);

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
    if (activeEmployeeId !== null) f.employee_id = activeEmployeeId;
    f.sortBy = activeSortBy;
    f.order = activeOrder;
    if (rangeStart && rangeEnd) {
      f.startDate = toYMD(rangeStart);
      f.endDate = toYMD(rangeEnd);
    } else {
      f.startDate = toYMD(new Date(viewYear, viewMonth, 1));
      f.endDate = toYMD(new Date(viewYear, viewMonth + 1, 0));
    }
    return f;
  }, [status, debouncedSearch, activeEmployeeId, activeSortBy, activeOrder, rangeStart, rangeEnd, viewMonth, viewYear]);

  const load = useCallback(async (page: number, append = false) => {
    if (page === 1) append ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getExpenses(buildFilters(page));
      if ((res as any)?.statusCode === 403 && (res as any)?.message === 'No active subscription found') {
        setNoSubscription(true);
        return;
      }
      setNoSubscription(false);
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

  useEffect(() => { load(1, false); }, [status, debouncedSearch, activeEmployeeId, activeSortBy, activeOrder, rangeStart, rangeEnd, viewMonth, viewYear]);

  useFocusEffect(useCallback(() => { load(1, false); }, [viewMonth, viewYear, rangeStart, rangeEnd, status, debouncedSearch, activeEmployeeId, activeSortBy, activeOrder]));

  const onRefresh = useCallback(() => load(1, false), [load]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && !loading && meta.hasNextPage) {
      load(meta.page + 1, true);
    }
  }, [loadingMore, loading, meta, load]);

  // Range picker handlers
  const openPicker = () => {
    setPickerYear(today.getFullYear()); setPickerMonth(today.getMonth());
    setPickingEnd(false); setShowRangePicker(true);
  };
  const handlePickerDay = useCallback((d: Date) => {
    if (!pickingEnd) { setRangeStart(d); setRangeEnd(null); setPickingEnd(true); }
    else {
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

  const handleAddExpense = async (data: {
    title: string; description: string; amount: number;
    expenseDate: string; receiptFile: { uri: string; name: string; type: string } | null;
  }) => {
    try {
      setLoading(true);
      await createExpense(data);
      load(1, false);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (status !== 'all') n++;
    if (debouncedSearch.trim()) n++;
    if (rangeStart || rangeEnd) n++;
    if (activeEmployeeId) n++;
    if (activeSortBy !== 'ExpenseDate' || activeOrder !== 'DESC') n++;
    return n;
  }, [status, debouncedSearch, rangeStart, rangeEnd, activeEmployeeId, activeSortBy, activeOrder]);

  const fetchEmployeeOptions = useCallback(async (query?: string) => {
    setEmployeeLoading(true);
    try {
      const res = await getEmployeeOptions(query);
      setEmployeeOptions((res.data ?? []).map(item => ({ label: item.employee_name, value: item.id })));
    } catch {
      setEmployeeOptions([]);
    } finally {
      setEmployeeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployeeOptions();
  }, [fetchEmployeeOptions]);

  const openFilter = useCallback(() => {
    setDraftStatus(status);
    setDraftEmployeeId(activeEmployeeId);
    setDraftEmployeeName(activeEmployeeName);
    setDraftStartDate(rangeStart ? toYMD(rangeStart) : '');
    setDraftEndDate(rangeEnd ? toYMD(rangeEnd) : '');
    setDraftSortBy(activeSortBy);
    setDraftOrder(activeOrder);
    setFilterVisible(true);
  }, [status, activeEmployeeId, activeEmployeeName, rangeStart, rangeEnd, activeSortBy, activeOrder]);

  const applyFilter = useCallback(() => {
    const parsedStart = draftStartDate ? new Date(draftStartDate) : null;
    const parsedEnd = draftEndDate ? new Date(draftEndDate) : null;
    setStatus(draftStatus);
    setActiveEmployeeId(draftEmployeeId);
    setActiveEmployeeName(draftEmployeeName);
    setActiveSortBy(draftSortBy);
    setActiveOrder(draftOrder);
    setRangeStart(parsedStart);
    setRangeEnd(parsedEnd);
    setPickingEnd(false);
    setFilterVisible(false);
  }, [draftStatus, draftEmployeeId, draftEmployeeName, draftStartDate, draftEndDate, draftSortBy, draftOrder]);

  const resetFilter = useCallback(() => {
    setDraftStatus('all');
    setDraftEmployeeId(null);
    setDraftEmployeeName('');
    setDraftStartDate('');
    setDraftEndDate('');
    setDraftSortBy('ExpenseDate');
    setDraftOrder('DESC');
    setStatus('all');
    setActiveEmployeeId(null);
    setActiveEmployeeName('');
    setActiveSortBy('ExpenseDate');
    setActiveOrder('DESC');
    setRangeStart(null);
    setRangeEnd(null);
    setPickingEnd(false);
    setFilterVisible(false);
  }, []);

  // Group flat records into day cards (mirrors attendance day-grouping)
  const listDays = useMemo(() => {
    const dayMap: Record<string, { date: Date; expenses: any[]; employeeName?: string }> = {};
    data.forEach(r => {
      const d = new Date(r.ExpenseDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${r.EmployeeId}`;
      if (!dayMap[key]) {
        dayMap[key] = { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), expenses: [], employeeName: r.EmployeeName };
      }
      dayMap[key].expenses.push({ ExpenseId: r.ExpenseId, ExpenseDate: r.ExpenseDate, Title: r.Title, Description: r.Description, Amount: r.Amount, Status: r.Status, ReceiptUrl: r.ReceiptUrl });
    });
    return Object.values(dayMap).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <ExpenseCard
      date={item.date}
      expenses={item.expenses}
      employeeName={item.employeeName}
      onStatusUpdated={() => load(1, false)}
    />
  ), [load]);

  const keyExtractor = useCallback((item: any, index: number) => `${item.date.getTime()}-${index}`, []);

  const ListHeader = useMemo(() => (
    <View style={{ paddingTop: 12 }}>
      {/* Header */}
      {/* <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Expenses</Text>
          <Text style={styles.headerSub}>All Employees</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
            <LinearGradient colors={['#6b6d71', '#4b5563']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add</Text>
              <Ionicons name="add" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View> */}


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
        {/* <StatCard label="Paid" count={meta.paid} color="#3b82f6" icon="cash-check" active={status === 'paid'} onPress={() => setStatus('paid')} /> */}
      </View>

      <JobSearchBar
        searchQuery={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch('')}
        activeFilterCount={activeFilterCount}
        totalJobs={meta.total}
        onOpenFilter={openFilter}
      />

    </View>
  ), [meta, status, search, rangeStart, rangeEnd, activeFilterCount, openFilter]);

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
    ) : !meta.hasNextPage && listDays.length > 0 ? (
      <View style={styles.footer}>
        <Text style={styles.footerText}>No more expenses</Text>
      </View>
    ) : null
  ), [loadingMore, meta.hasNextPage, data.length]);

  if (loading && !refreshing) return <ExpenseSkeleton />;

  if (noSubscription) return <NoActiveSubscription />;

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={styles.root}>
      <FlatList
        data={listDays}
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
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Paid', value: 'paid' },
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, draftStatus === option.value && styles.chipActive]}
              onPress={() => setDraftStatus(option.value as FilterStatus)}
            >
              <Text style={[styles.chipText, draftStatus === option.value && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Employee</Text>
        <SearchableSelect
          label="Employee"
          options={employeeOptions}
          value={draftEmployeeId}
          onChange={(value) => {
            const selected = typeof value === 'number' ? value : value ? Number(value) : null;
            setDraftEmployeeId(selected);
            const selectedName = employeeOptions.find(option => option.value === selected)?.label || '';
            setDraftEmployeeName(selectedName);
          }}
          placeholder="Select an employee"
          leftIcon="person"
          searchPlaceholder="Search by name..."
          emptyStateText="No employees found"
          loading={employeeLoading}
          onSearch={fetchEmployeeOptions}
        />

        <Text style={styles.label}>Sort By</Text>
        <View style={styles.chipRow}>
          {[
            { label: 'Expense Date', value: 'ExpenseDate' },
            { label: 'Amount', value: 'Amount' },
            { label: 'Status', value: 'Status' },
            { label: 'Employee', value: 'EmployeeName' },
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, draftSortBy === option.value && styles.chipActive]}
              onPress={() => setDraftSortBy(option.value as 'ExpenseDate' | 'Amount' | 'Status' | 'EmployeeName')}
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

        <Text style={styles.label}>Date Range</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draftStartDate}
            onChangeText={setDraftStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.rangeDash}>→</Text>
          <TextInput
            style={styles.input}
            value={draftEndDate}
            onChangeText={setDraftEndDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </CompanyFilterSheet>

      <AddExpenseModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddExpense={handleAddExpense}
      />

      <ReportModal
        visible={showReport}
        title="Share Expense Report"
        onClose={() => setShowReport(false)}
        onShare={shareExpenseReport}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  headerSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 2 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  filterBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  listTitle: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },
  label: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 8, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  chipActive: { backgroundColor: '#1B2E6F', borderColor: '#1B2E6F' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: '#FAFAFA',
    color: theme.colors.text,
  },
  rangeDash: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14 },
  footer: { alignItems: 'center', paddingVertical: 16 },
  footerText: { color: theme.colors.textSecondary, fontSize: 12 },
  loadingOverlay: { position: 'absolute', top: 12, right: 20, zIndex: 10 },
});
