// app/(company)/(tabs)/attendance.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AttendanceSkeleton } from "@/components/common/SkeletonLoader";
import HeaderActionButton from "@/components/common/HeaderActionButton";
import ReportModal from "@/components/report/ReportModal";
import { shareAttendanceReport } from "@/services/company/report.service";
import { theme } from "../../../theme/index";
import { formatTimeIST, getISTDate, toYMD } from "@/utils/timeHelpers";
import {
  fmtDate,
  parseAttendanceRecords,
  toDateObj,
} from "@/utils/attendanceHelpers";
import {
  AttendanceRecord,
  AttendanceMeta,
  getAttendance,
} from "@/services/employees/attendance.service";
import NoActiveSubscription from "@/components/common/NoActiveSubscription";
import DayCard, { DayCardPunch } from "@/components/company/attendance/DayCard";
import RangeSummary from "@/components/employees/attendance_list/RangeSummary";
import MonthNavigator from "@/components/common/MonthNavigator";
import StatCard from "@/components/common/StatCard";
import DateRangeModal from "@/components/employees/attendance_list/DateRangeModal";
import CompanyFilterSheet from "@/components/company/common/CompanyFilterSheet";
import { JobSearchBar } from "@/components/company/jobs";
import SearchableSelect from "@/components/common/SearchableSelect";
import { getEmployeeOptions } from "@/services/company/job.service";

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
  const navigation = useNavigation();
  const drawerNavigation = navigation.getParent();

  const [showReport, setShowReport] = useState(false);
  const [noSubscription, setNoSubscription] = useState(false);

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

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [draftStatus, setDraftStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [activeStatus, setActiveStatus] = useState<
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
  const [activeEmployeeId, setActiveEmployeeId] = useState<number | null>(null);
  const [draftEmployeeId, setDraftEmployeeId] = useState<number | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [draftEmployeeName, setDraftEmployeeName] = useState("");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [employeeOptions, setEmployeeOptions] = useState<
    Array<{ label: string; value: number }>
  >([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pickingEnd, setPickingEnd] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());

  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [meta, setMeta] = useState<AttendanceMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(
      () => setDebouncedSearch(searchQuery),
      400,
    );
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQuery]);

  const isFutureMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());
  const rangeActive = !!(rangeStart && rangeEnd);

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
          status: activeStatus,
          search: debouncedSearch.trim(),
          employeeId: activeEmployeeId ?? undefined,
          startDate: start,
          endDate: end,
          sortBy: activeSortBy,
          order: activeOrder,
          page,
          limit: LIMIT,
        });
        if (
          res?.statusCode === 403 &&
          res?.message === "No active subscription found"
        ) {
          setNoSubscription(true);
          return;
        }
        setNoSubscription(false);
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
    [
      activeStatus,
      activeSortBy,
      activeOrder,
      debouncedSearch,
      activeEmployeeId,
      getDateRange,
    ],
  );

  useEffect(() => {
    load(1, false);
  }, [
    viewYear,
    viewMonth,
    activeStatus,
    debouncedSearch,
    activeEmployeeId,
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
      activeStatus,
      debouncedSearch,
      activeEmployeeId,
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
      : "pending";
  };

  const dominantStatus = (
    punches: DayCardPunch[],
  ): "approved" | "rejected" | "pending" => {
    if (punches.some((p) => p.status === "pending")) return "pending";
    if (punches.some((p) => p.status === "rejected")) return "rejected";
    return "approved";
  };

  // Group flat records into day cards
  const listDays = useMemo(() => {
    const dayMap: Record<
      string,
      {
        date: Date;
        punches: DayCardPunch[];
        employeeName?: string;
        employeeCode?: string;
      }
    > = {};

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
        attendanceId: r.AttendanceId,
        remarks: r.Remarks,
      });

      if (!(dayMap[key] as any).employeeName) {
        (dayMap[key] as any).employeeName = r.EmployeeName;
        (dayMap[key] as any).employeeCode = r.EmployeeCode;
      }
    });

    return Object.values(dayMap).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }, [attendanceRecords]);

  // Month / range navigation
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

  const openPicker = () => {
    setPickerYear(today.getFullYear());
    setPickerMonth(today.getMonth());
    setPickingEnd(false);
    setShowRangePicker(true);
  };
  const handlePickerDay = useCallback(
    (d: Date) => {
      if (!pickingEnd) {
        setRangeStart(d);
        setRangeEnd(null);
        setPickingEnd(true);
      } else {
        if (rangeStart && d < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(d);
        } else setRangeEnd(d);
        setPickingEnd(false);
      }
    },
    [pickingEnd, rangeStart],
  );
  const applyRange = () => {
    if (rangeStart && rangeEnd) setShowRangePicker(false);
  };
  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setPickingEnd(false);
  };
  const selectThisMonth = () => {
    setRangeStart(new Date(today.getFullYear(), today.getMonth(), 1));
    setRangeEnd(today);
    setPickingEnd(false);
    setShowRangePicker(false);
  };
  const selectLast7Days = () => {
    const s = new Date(today);
    s.setDate(s.getDate() - 6);
    setRangeStart(s);
    setRangeEnd(today);
    setPickingEnd(false);
    setShowRangePicker(false);
  };
  const selectLast30Days = () => {
    const s = new Date(today);
    s.setDate(s.getDate() - 29);
    setRangeStart(s);
    setRangeEnd(today);
    setPickingEnd(false);
    setShowRangePicker(false);
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
    if (activeStatus !== "all") count += 1;
    if (debouncedSearch.trim()) count += 1;
    if (rangeStart || rangeEnd) count += 1;
    if (activeEmployeeId) count += 1;
    if (activeSortBy !== "created_at" || activeOrder !== "DESC") count += 1;
    return count;
  }, [
    activeStatus,
    debouncedSearch,
    rangeStart,
    rangeEnd,
    activeEmployeeId,
    activeSortBy,
    activeOrder,
  ]);

  const fetchEmployeeOptions = useCallback(async (query?: string) => {
    setEmployeeLoading(true);
    try {
      const res = await getEmployeeOptions(query);
      setEmployeeOptions(
        (res.data ?? []).map((item) => ({
          label: item.employee_name,
          value: item.id,
        })),
      );
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
    setDraftStatus(activeStatus);
    setDraftEmployeeId(activeEmployeeId);
    setDraftEmployeeName(employeeName);
    setDraftStartDate(rangeStart ? toYMD(rangeStart) : "");
    setDraftEndDate(rangeEnd ? toYMD(rangeEnd) : "");
    setDraftSortBy(activeSortBy);
    setDraftOrder(activeOrder);
    setFilterVisible(true);
  }, [
    activeStatus,
    activeEmployeeId,
    employeeName,
    rangeStart,
    rangeEnd,
    activeSortBy,
    activeOrder,
  ]);

  const applyFilter = useCallback(() => {
    const parsedStart = draftStartDate ? new Date(draftStartDate) : null;
    const parsedEnd = draftEndDate ? new Date(draftEndDate) : null;
    setActiveStatus(draftStatus);
    setActiveEmployeeId(draftEmployeeId);
    setEmployeeName(draftEmployeeName);
    setActiveSortBy(draftSortBy);
    setActiveOrder(draftOrder);
    setRangeStart(parsedStart);
    setRangeEnd(parsedEnd);
    setPickingEnd(false);
    setFilterVisible(false);
  }, [
    draftStatus,
    draftEmployeeId,
    draftEmployeeName,
    draftStartDate,
    draftEndDate,
    draftSortBy,
    draftOrder,
  ]);

  const resetFilter = useCallback(() => {
    setDraftStatus("all");
    setDraftEmployeeId(null);
    setDraftEmployeeName("");
    setDraftStartDate("");
    setDraftEndDate("");
    setDraftSortBy("created_at");
    setDraftOrder("DESC");
    setActiveStatus("all");
    setActiveEmployeeId(null);
    setEmployeeName("");
    setActiveSortBy("created_at");
    setActiveOrder("DESC");
    setRangeStart(null);
    setRangeEnd(null);
    setPickingEnd(false);
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
        employeeName={item.employeeName}
        employeeCode={item.employeeCode}
        status={dominantStatus(item.punches)}
        onStatusUpdated={() => load(1, false)}
      />
    ),
    [load],
  );

  const ListHeader = useMemo(
    () => (
      <View style={{ paddingTop: 12 }}>
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
                active={activeStatus === "all"}
                onPress={() => setActiveStatus("all")}
              />
              <StatCard
                label="Pending"
                count={monthCounts.pending}
                color="#d97706"
                icon="clock-fast"
                active={activeStatus === "pending"}
                onPress={() => setActiveStatus("pending")}
              />
              <StatCard
                label="Approved"
                count={monthCounts.approved}
                color="#16a34a"
                icon="check-circle"
                active={activeStatus === "approved"}
                onPress={() => setActiveStatus("approved")}
              />
              <StatCard
                label="Rejected"
                count={monthCounts.rejected}
                color="#dc2626"
                icon="close-octagon"
                active={activeStatus === "rejected"}
                onPress={() => setActiveStatus("rejected")}
              />
            </View>
          </>
        )}

        <JobSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          activeFilterCount={activeFilterCount}
          totalJobs={meta.total}
          onOpenFilter={openFilter}
        />
      </View>
    ),
    [
      meta,
      activeStatus,
      viewMonth,
      viewYear,
      rangeActive,
      rangeStart,
      rangeEnd,
      isFutureMonth,
      searchQuery,
      activeFilterCount,
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

  if (loading && !refreshing) return <AttendanceSkeleton />;

  if (noSubscription) return <NoActiveSubscription />;

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

      <DateRangeModal
        visible={showRangePicker}
        onClose={() => setShowRangePicker(false)}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        pickingEnd={pickingEnd}
        pickerYear={pickerYear}
        pickerMonth={pickerMonth}
        onPickerYearMonthChange={(y, m) => {
          setPickerYear(y);
          setPickerMonth(m);
        }}
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

        <Text style={styles.label}>Employee</Text>
        <SearchableSelect
          label="Employee"
          options={employeeOptions}
          value={draftEmployeeId}
          onChange={(value) => {
            const selected =
              typeof value === "number" ? value : value ? Number(value) : null;
            setDraftEmployeeId(selected);
            const selectedName =
              employeeOptions.find((option) => option.value === selected)
                ?.label || "";
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

      <ReportModal
        visible={showReport}
        title="Share Attendance Report"
        onClose={() => setShowReport(false)}
        onShare={shareAttendanceReport}
      />
    </LinearGradient>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 6 },
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reportBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
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
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14 },
  footer: { alignItems: "center", paddingVertical: 16 },
  footerText: { color: theme.colors.textSecondary, fontSize: 12 },
  loadingOverlay: { position: "absolute", top: 12, right: 20, zIndex: 10 },
  loadingFooter: { alignItems: "center", paddingVertical: 16 },
});
