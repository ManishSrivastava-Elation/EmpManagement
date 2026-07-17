// app/(employee)/(tabs)/attendance.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { EmployeeAttendanceSkeleton } from "@/components/common/SkeletonLoader";
import { theme } from "../../../theme/index";
import { formatTimeIST, getISTDate, toYMD } from "@/utils/timeHelpers";
import { fmtDate, toDateObj } from "@/utils/attendanceHelpers";
import {
  AttendanceRecord,
  AttendanceMeta,
  getAttendance,
} from "@/services/employees/attendance.service";
import DayCard, {
  DayCardPunch,
} from "@/components/employees/attendance_list/DayCard";
import RangeSummary from "@/components/employees/attendance_list/RangeSummary";
import MonthNavigator from "@/components/common/MonthNavigator";
import StatCard from "@/components/common/StatCard";
import CompanyFilterSheet from "@/components/company/common/CompanyFilterSheet";
import { JobSearchBar } from "@/components/company/jobs";

const LIMIT = 10;
const EMPTY_META: AttendanceMeta = {
  page: 1,
  limit: LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
  pending: 0,
  approved: 0,
  rejected: 0,
};

export default function AttendanceScreen() {
  const today = getISTDate();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [draftStatus, setDraftStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [activeSortBy, setActiveSortBy] = useState<
    | "attendance_id"
    | "check_in_time"
    | "created_at"
    | "status"
    | "employee_name"
  >("created_at");
  const [activeOrder, setActiveOrder] = useState<"ASC" | "DESC">("DESC");
  const [draftSortBy, setDraftSortBy] = useState<
    | "attendance_id"
    | "check_in_time"
    | "created_at"
    | "status"
    | "employee_name"
  >("created_at");
  const [draftOrder, setDraftOrder] = useState<"ASC" | "DESC">("DESC");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [meta, setMeta] = useState<AttendanceMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isFutureMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());
  const rangeActive = !!(rangeStart && rangeEnd);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getDateRange = useCallback(() => {
    if (rangeStart && rangeEnd)
      return { start: toYMD(rangeStart), end: toYMD(rangeEnd) };
    return {
      start: toYMD(new Date(viewYear, viewMonth, 1)),
      end: toYMD(new Date(viewYear, viewMonth + 1, 0)),
    };
  }, [rangeStart, rangeEnd, viewYear, viewMonth]);

  const load = useCallback(
    async (page: number, append = false) => {
      if (page === 1) append ? setRefreshing(true) : setLoading(true);
      else setLoadingMore(true);

      try {
        const { start, end } = getDateRange();
        const res = await getAttendance({
          status: filter,
          search: debouncedSearch.trim(),
          startDate: start,
          endDate: end,
          sortBy: activeSortBy,
          order: activeOrder,
          page,
          limit: LIMIT,
        });
        setAttendanceRecords((prev) =>
          append && page > 1
            ? [...prev, ...(res?.data ?? [])]
            : (res?.data ?? []),
        );
        setMeta(res?.meta ?? EMPTY_META);
      } catch (e) {
        console.log("load attendance error", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [filter, debouncedSearch, activeSortBy, activeOrder, getDateRange],
  );

  useEffect(() => {
    load(1, false);
  }, [
    viewYear,
    viewMonth,
    filter,
    debouncedSearch,
    activeSortBy,
    activeOrder,
    rangeStart,
    rangeEnd,
  ]);

  useFocusEffect(
    useCallback(() => {
      load(1, false);
    }, [
      viewYear,
      viewMonth,
      filter,
      debouncedSearch,
      activeSortBy,
      activeOrder,
      rangeStart,
      rangeEnd,
    ]),
  );

  const onRefresh = useCallback(() => load(1, false), [load]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && !loading && meta.hasNextPage) {
      load(meta.page + 1, true);
    }
  }, [loadingMore, loading, meta, load]);

  const normalizeStatus = (
    value?: string,
  ): "approved" | "rejected" | "pending" => {
    const s = String(value ?? "")
      .trim()
      .toLowerCase();
    return s === "approved" || s === "rejected" || s === "pending"
      ? s
      : "approved";
  };

  // Group flat records into day cards
  const listDays = useMemo(() => {
    const dayMap: Record<string, { date: Date; punches: DayCardPunch[] }> = {};

    attendanceRecords.forEach((r) => {
      const recDate = new Date(r.CheckInTime || r.CreatedAt);
      const key = `${recDate.getFullYear()}-${recDate.getMonth()}-${recDate.getDate()}`;

      if (!dayMap[key]) {
        dayMap[key] = {
          date: toDateObj(
            recDate.getFullYear(),
            recDate.getMonth(),
            recDate.getDate(),
          ),
          punches: [],
        };
      }

      dayMap[key].punches.push({
        checkIn: formatTimeIST(r.CheckInTime),
        checkOut: r.CheckOutTime ? formatTimeIST(r.CheckOutTime) : null,
        address: r.Address,
        dynamicAddress: r.DynamicAddress,
        checkInImg: (r as any).CheckInSelfieUrl || undefined,
        checkOutImg: (r as any).CheckOutSelfieUrl || undefined,
        status: normalizeStatus((r as any).Status),
        remarks: r.Remarks,
      });
    });

    return Object.values(dayMap).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }, [attendanceRecords]);

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

  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
  };

  const monthCounts = useMemo(
    () => ({
      all: meta.total,
      pending: meta.pending,
      approved: meta.approved,
      rejected: meta.rejected,
    }),
    [meta],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter !== "all") count += 1;
    if (debouncedSearch.trim()) count += 1;
    if (rangeStart || rangeEnd) count += 1;
    if (activeSortBy !== "created_at" || activeOrder !== "DESC") count += 1;
    return count;
  }, [
    filter,
    debouncedSearch,
    rangeStart,
    rangeEnd,
    activeSortBy,
    activeOrder,
  ]);

  const openFilter = useCallback(() => {
    setDraftStatus(filter);
    setDraftSortBy(activeSortBy);
    setDraftOrder(activeOrder);
    setDraftStartDate(rangeStart ? toYMD(rangeStart) : "");
    setDraftEndDate(rangeEnd ? toYMD(rangeEnd) : "");
    setFilterVisible(true);
  }, [filter, activeSortBy, activeOrder, rangeStart, rangeEnd]);

  const applyFilter = useCallback(() => {
    const parsedStart = draftStartDate ? new Date(draftStartDate) : null;
    const parsedEnd = draftEndDate ? new Date(draftEndDate) : null;
    setFilter(draftStatus);
    setActiveSortBy(draftSortBy);
    setActiveOrder(draftOrder);
    setRangeStart(parsedStart);
    setRangeEnd(parsedEnd);
    setFilterVisible(false);
  }, [draftStatus, draftSortBy, draftOrder, draftStartDate, draftEndDate]);

  const resetFilter = useCallback(() => {
    setDraftStatus("all");
    setDraftSortBy("created_at");
    setDraftOrder("DESC");
    setDraftStartDate("");
    setDraftEndDate("");
    setFilter("all");
    setActiveSortBy("created_at");
    setActiveOrder("DESC");
    setRangeStart(null);
    setRangeEnd(null);
    setFilterVisible(false);
  }, []);

  const keyExtractor = useCallback(
    (item: any, index: number) => `${item.date.getTime()}-${index}`,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <DayCard
        date={item.date}
        punches={item.punches}
        status={item.punches?.[0]?.status || "approved"}
      />
    ),
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View style={{ paddingTop: 12 }}>
        <JobSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          activeFilterCount={activeFilterCount}
          totalJobs={meta.total}
          onOpenFilter={openFilter}
        />

        {rangeActive && (
          <RangeSummary
            counts={{
              present: meta.approved,
              absent: meta.rejected,
              na: meta.pending,
            }}
            startDate={rangeStart!}
            endDate={rangeEnd!}
            onClear={clearRange}
          />
        )}

        {!rangeActive && (
          <>
            <MonthNavigator
              month={viewMonth}
              year={viewYear}
              onPrev={prevMonth}
              onNext={nextMonth}
              disableNext={isFutureMonth}
            />
            <View style={styles.statsRow}>
              <StatCard
                label="All"
                count={monthCounts.all}
                color={theme.colors.primary}
                icon="calendar-check"
                active={filter === "all"}
                onPress={() => setFilter("all")}
              />
              <StatCard
                label="Pending"
                count={monthCounts.pending}
                color="#d97706"
                icon="clock-fast"
                active={filter === "pending"}
                onPress={() => setFilter("pending")}
              />
              <StatCard
                label="Approved"
                count={monthCounts.approved}
                color="#16a34a"
                icon="check-circle"
                active={filter === "approved"}
                onPress={() => setFilter("approved")}
              />
              <StatCard
                label="Rejected"
                count={monthCounts.rejected}
                color="#dc2626"
                icon="close-octagon"
                active={filter === "rejected"}
                onPress={() => setFilter("rejected")}
              />
            </View>
          </>
        )}
      </View>
    ),
    [
      meta,
      filter,
      searchQuery,
      activeFilterCount,
      viewMonth,
      viewYear,
      rangeActive,
      rangeStart,
      rangeEnd,
      isFutureMonth,
      openFilter,
    ],
  );

  const ListEmpty = useMemo(
    () =>
      loading ? null : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No attendance records found</Text>
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
      ) : !meta.hasNextPage && listDays.length > 0 ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>No more records</Text>
        </View>
      ) : null,
    [loadingMore, meta.hasNextPage, listDays.length],
  );

  if (loading && !refreshing) {
    return <EmployeeAttendanceSkeleton />;
  }

  return (
    <LinearGradient
      colors={["#f8f9fa", "#f1f3f5", "#e9ecef"]}
      style={styles.root}
    >
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
              onPress={() =>
                setDraftStatus(
                  option.value as "all" | "pending" | "approved" | "rejected",
                )
              }
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
            { label: "Created Date", value: "created_at" },
            { label: "Check-in Date", value: "check_in_time" },
            { label: "Status", value: "status" },
            { label: "Employee", value: "employee_name" },
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
                    | "attendance_id"
                    | "check_in_time"
                    | "created_at"
                    | "status"
                    | "employee_name",
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
    </LinearGradient>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  rangeTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxWidth: width - 160,
  },
  rangeTriggerActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rangeTriggerText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
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
