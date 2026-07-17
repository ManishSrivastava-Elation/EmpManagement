// app/(employee)/(tabs)/expense.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import HeaderActionButton from "@/components/common/HeaderActionButton";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { EmployeeExpenseSkeleton } from "@/components/common/SkeletonLoader";
import { theme } from "@/theme";
import { toYMD } from "@/utils/timeHelpers";
import { fmtDate } from "@/utils/attendanceHelpers";
import {
  getExpenses,
  type ApiExpense,
  type ExpenseMeta,
  type ExpenseFilters,
  type ExpenseStatus,
} from "@/services/employees/expense.service";
import ExpenseCard from "@/components/expense/ExpenseCard";
import StatCard from "@/components/common/StatCard";
import MonthNavigator from "@/components/common/MonthNavigator";
import AddExpenseModal from "@/components/employees/expense/AddExpenseModal";
import CompanyFilterSheet from "@/components/company/common/CompanyFilterSheet";
import { JobSearchBar } from "@/components/company/jobs";
import { createExpense } from "@/services/employees/expense.service";
import { Alert } from "react-native";

const LIMIT = 10;

type FilterStatus = "all" | ExpenseStatus;

const EMPTY_META: ExpenseMeta = {
  page: 1,
  limit: LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  pending: 0,
  approved: 0,
  rejected: 0,
};

export default function ExpenseScreen() {
  const today = new Date();
  const navigation = useNavigation();
  const drawerNavigation = navigation.getParent();

  // Declared before useLayoutEffect to avoid stale closure
  const [addModalVisible, setAddModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      drawerNavigation?.setOptions({
        headerRight: () => (
          <HeaderActionButton
            visible={true}
            title="Add Expense"
            onPress={() => setAddModalVisible(true)}
          />
        ),
      });
      return () => drawerNavigation?.setOptions({ headerRight: undefined });
    }, [drawerNavigation]),
  );

  // Filter state
  const [status, setStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [draftStatus, setDraftStatus] = useState<FilterStatus>("all");
  const [activeSortBy, setActiveSortBy] = useState<
    "ExpenseDate" | "Amount" | "Status" | "EmployeeName"
  >("ExpenseDate");
  const [activeOrder, setActiveOrder] = useState<"ASC" | "DESC">("DESC");
  const [draftSortBy, setDraftSortBy] = useState<
    "ExpenseDate" | "Amount" | "Status" | "EmployeeName"
  >("ExpenseDate");
  const [draftOrder, setDraftOrder] = useState<"ASC" | "DESC">("DESC");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  // Month navigator state
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const isFutureMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (isFutureMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  // Data state
  const [data, setData] = useState<ApiExpense[]>([]);
  const [meta, setMeta] = useState<ExpenseMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  const buildFilters = useCallback(
    (page: number): ExpenseFilters => {
      const f: ExpenseFilters = { page, limit: LIMIT };
      if (status !== "all") f.status = status;
      if (debouncedSearch.trim()) f.search = debouncedSearch.trim();
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
    },
    [
      status,
      debouncedSearch,
      activeSortBy,
      activeOrder,
      rangeStart,
      rangeEnd,
      viewMonth,
      viewYear,
    ],
  );

  const load = useCallback(
    async (page: number, append = false) => {
      if (page === 1) append ? setRefreshing(true) : setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await getExpenses(buildFilters(page));
        setData((prev) =>
          append && page > 1
            ? [...prev, ...(res.data ?? [])]
            : (res.data ?? []),
        );
        setMeta(res?.meta ?? EMPTY_META);
      } catch (e) {
        console.log("load expenses error", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [buildFilters],
  );

  useEffect(() => {
    load(1, false);
  }, [
    status,
    debouncedSearch,
    activeSortBy,
    activeOrder,
    rangeStart,
    rangeEnd,
    viewMonth,
    viewYear,
  ]);

  useFocusEffect(
    useCallback(() => {
      load(1, false);
    }, [
      viewMonth,
      viewYear,
      rangeStart,
      rangeEnd,
      status,
      debouncedSearch,
      activeSortBy,
      activeOrder,
    ]),
  );

  const onRefresh = useCallback(() => load(1, false), [load]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && !loading && meta.hasNextPage) {
      load(meta.page + 1, true);
    }
  }, [loadingMore, loading, meta, load]);

  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
  };

  const handleAddExpense = async (formData: {
    type: string;
    description: string;
    amount: number;
    hasBill: boolean;
    billFile: { uri: string; name: string; type: string } | null;
  }) => {
    try {
      await createExpense({
        title: formData.type,
        description: formData.description,
        amount: formData.amount,
        expenseDate: new Date().toISOString().split("T")[0],
        receiptFile: formData.billFile,
      });
      Alert.alert("Success", "Expense added successfully!");
      load(1, false);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to add expense",
      );
    }
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (status !== "all") n++;
    if (debouncedSearch.trim()) n++;
    if (rangeStart || rangeEnd) n++;
    if (activeSortBy !== "ExpenseDate" || activeOrder !== "DESC") n++;
    return n;
  }, [
    status,
    debouncedSearch,
    rangeStart,
    rangeEnd,
    activeSortBy,
    activeOrder,
  ]);

  const openFilter = useCallback(() => {
    setDraftStatus(status);
    setDraftSortBy(activeSortBy);
    setDraftOrder(activeOrder);
    setDraftStartDate(rangeStart ? toYMD(rangeStart) : "");
    setDraftEndDate(rangeEnd ? toYMD(rangeEnd) : "");
    setFilterVisible(true);
  }, [status, activeSortBy, activeOrder, rangeStart, rangeEnd]);

  const applyFilter = useCallback(() => {
    const parsedStart = draftStartDate ? new Date(draftStartDate) : null;
    const parsedEnd = draftEndDate ? new Date(draftEndDate) : null;
    setStatus(draftStatus);
    setActiveSortBy(draftSortBy);
    setActiveOrder(draftOrder);
    setRangeStart(parsedStart);
    setRangeEnd(parsedEnd);
    setFilterVisible(false);
  }, [draftStatus, draftSortBy, draftOrder, draftStartDate, draftEndDate]);

  const resetFilter = useCallback(() => {
    setDraftStatus("all");
    setDraftSortBy("ExpenseDate");
    setDraftOrder("DESC");
    setDraftStartDate("");
    setDraftEndDate("");
    setStatus("all");
    setActiveSortBy("ExpenseDate");
    setActiveOrder("DESC");
    setRangeStart(null);
    setRangeEnd(null);
    setFilterVisible(false);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ApiExpense }) => <ExpenseCard item={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: ApiExpense) => String(item.ExpenseId),
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View style={{ paddingTop: 12 }}>
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
          <StatCard
            label="All"
            count={meta.total}
            color={theme.colors.primary}
            icon="receipt"
            active={status === "all"}
            onPress={() => setStatus("all")}
          />
          <StatCard
            label="Pending"
            count={meta.pending}
            color="#f59e0b"
            icon="clock-outline"
            active={status === "pending"}
            onPress={() => setStatus("pending")}
          />
          <StatCard
            label="Approved"
            count={meta.approved}
            color="#22c55e"
            icon="check-circle"
            active={status === "approved"}
            onPress={() => setStatus("approved")}
          />
          <StatCard
            label="Rejected"
            count={meta.rejected}
            color="#ef4444"
            icon="close-circle"
            active={status === "rejected"}
            onPress={() => setStatus("rejected")}
          />
        </View>

        <JobSearchBar
          searchQuery={search}
          onSearchChange={setSearch}
          onClearSearch={() => setSearch("")}
          activeFilterCount={activeFilterCount}
          totalJobs={meta.total}
          onOpenFilter={openFilter}
        />
      </View>
    ),
    [meta, status, search, rangeStart, rangeEnd, activeFilterCount],
  );

  const ListEmpty = useMemo(
    () =>
      loading ? null : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No expenses found</Text>
        </View>
      ),
    [loading],
  );

  const ListFooter = useMemo(
    () =>
      loadingMore ? (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : !meta.hasNextPage && data.length > 0 ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>No more expenses</Text>
        </View>
      ) : null,
    [loadingMore, meta.hasNextPage, data.length],
  );

  if (loading && !refreshing) {
    return <EmployeeExpenseSkeleton />;
  }

  return (
    <LinearGradient
      colors={["#f8f9fa", "#f1f3f5", "#e9ecef"]}
      style={styles.root}
    >
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
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                draftStatus === option.value && styles.chipActive,
              ]}
              onPress={() => setDraftStatus(option.value as FilterStatus)}
            >
              <Text
                style={[
                  styles.chipText,
                  draftStatus === option.value && styles.chipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Sort By</Text>
        <View style={styles.chipRow}>
          {[
            { label: "Expense Date", value: "ExpenseDate" },
            { label: "Amount", value: "Amount" },
            { label: "Status", value: "Status" },
            { label: "Employee", value: "EmployeeName" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                draftSortBy === option.value && styles.chipActive,
              ]}
              onPress={() =>
                setDraftSortBy(
                  option.value as
                    | "ExpenseDate"
                    | "Amount"
                    | "Status"
                    | "EmployeeName",
                )
              }
            >
              <Text
                style={[
                  styles.chipText,
                  draftSortBy === option.value && styles.chipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Order</Text>
        <View style={styles.chipRow}>
          {[
            { label: "Ascending", value: "ASC" },
            { label: "Descending", value: "DESC" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                draftOrder === option.value && styles.chipActive,
              ]}
              onPress={() => setDraftOrder(option.value as "ASC" | "DESC")}
            >
              <Text
                style={[
                  styles.chipText,
                  draftOrder === option.value && styles.chipTextActive,
                ]}
              >
                {option.label}
              </Text>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  headerSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  listTitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14 },
  footer: { alignItems: "center", paddingVertical: 16 },
  footerText: { color: theme.colors.textSecondary, fontSize: 12 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 8,
    marginTop: 8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  chipActive: { backgroundColor: "#1B2E6F", borderColor: "#1B2E6F" },
  chipText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: "#FAFAFA",
    color: theme.colors.text,
  },
  rangeDash: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
});
