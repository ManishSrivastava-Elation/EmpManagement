// app/(employee)/(tabs)/attendance.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../theme/index';
import { formatTimeIST, getISTDate, toYMD } from '@/utils/timeHelpers';
import { fmtDate, toDateObj } from '@/utils/attendanceHelpers';
import { AttendanceRecord, AttendanceMeta, getAttendance } from '@/services/employees/attendance.service';
import DayCard, { DayCardPunch } from '@/components/employees/attendance_list/DayCard';
import RangeSummary from '@/components/employees/attendance_list/RangeSummary';
import MonthNavigator from '@/components/common/MonthNavigator';
import StatCard from '@/components/common/StatCard';
import DateRangeModal from '@/components/employees/attendance_list/DateRangeModal';

const LIMIT = 10;
const EMPTY_META: AttendanceMeta = { page: 1, limit: LIMIT, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false, pending: 0, approved: 0, rejected: 0 };

export default function AttendanceScreen() {
  const today = getISTDate();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [meta, setMeta] = useState<AttendanceMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isFutureMonth = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth());
  const rangeActive = !!(rangeStart && rangeEnd);

  const getDateRange = useCallback(() => {
    if (rangeStart && rangeEnd) return { start: toYMD(rangeStart), end: toYMD(rangeEnd) };
    return { start: toYMD(new Date(viewYear, viewMonth, 1)), end: toYMD(new Date(viewYear, viewMonth + 1, 0)) };
  }, [rangeStart, rangeEnd, viewYear, viewMonth]);

  const load = useCallback(async (page: number, append = false) => {
    if (page === 1) append ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);

    try {
      const { start, end } = getDateRange();
      const res = await getAttendance({
        status: filter,
        startDate: start,
        endDate: end,
        page,
        limit: LIMIT,
      });
      setAttendanceRecords(prev => append && page > 1 ? [...prev, ...(res?.data ?? [])] : (res?.data ?? []));
      setMeta(res?.meta ?? EMPTY_META);
    } catch (e) {
      console.log('load attendance error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [filter, getDateRange]);

  useEffect(() => { load(1, false); }, [viewYear, viewMonth, filter, rangeStart, rangeEnd]);

  useFocusEffect(useCallback(() => { load(1, false); }, [viewYear, viewMonth, filter, rangeStart, rangeEnd]));

  const onRefresh = useCallback(() => load(1, false), [load]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && !loading && meta.hasNextPage) {
      load(meta.page + 1, true);
    }
  }, [loadingMore, loading, meta, load]);

  const normalizeStatus = (value?: string): 'approved' | 'rejected' | 'pending' => {
    const s = String(value ?? '').trim().toLowerCase();
    return s === 'approved' || s === 'rejected' || s === 'pending' ? s : 'approved';
  };

  // Group flat records into day cards
  const listDays = useMemo(() => {
    const dayMap: Record<string, { date: Date; punches: DayCardPunch[] }> = {};

    attendanceRecords.forEach(r => {
      const recDate = new Date(r.CheckInTime || r.CreatedAt);
      const key = `${recDate.getFullYear()}-${recDate.getMonth()}-${recDate.getDate()}`;

      if (!dayMap[key]) {
        dayMap[key] = { date: toDateObj(recDate.getFullYear(), recDate.getMonth(), recDate.getDate()), punches: [] };
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

    return Object.values(dayMap).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [attendanceRecords]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isFutureMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const openPicker = () => { setPickerYear(today.getFullYear()); setPickerMonth(today.getMonth()); setPickingEnd(false); setShowRangePicker(true); };
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
  const selectThisMonth = () => { setRangeStart(new Date(today.getFullYear(), today.getMonth(), 1)); setRangeEnd(today); setPickingEnd(false); setShowRangePicker(false); };
  const selectLast7Days = () => { const s = new Date(today); s.setDate(s.getDate() - 6); setRangeStart(s); setRangeEnd(today); setPickingEnd(false); setShowRangePicker(false); };
  const selectLast30Days = () => { const s = new Date(today); s.setDate(s.getDate() - 29); setRangeStart(s); setRangeEnd(today); setPickingEnd(false); setShowRangePicker(false); };

  const monthCounts = useMemo(() => ({
    all: meta.total, pending: meta.pending, approved: meta.approved, rejected: meta.rejected,
  }), [meta]);

  const keyExtractor = useCallback((item: any, index: number) => `${item.date.getTime()}-${index}`, []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <DayCard
      date={item.date}
      punches={item.punches}
      status={item.punches?.[0]?.status || 'approved'}
    />
  ), []);

  const ListHeader = useMemo(() => (
    <View style={{ paddingTop: 12 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <TouchableOpacity
          onPress={openPicker}
          style={[styles.rangeTrigger, rangeActive && styles.rangeTriggerActive]}
        >
          <MaterialCommunityIcons name="calendar-range" size={18} color={rangeActive ? theme.colors.white : theme.colors.primary} />
          <Text style={[styles.rangeTriggerText, rangeActive && { color: theme.colors.white }]}>
            {rangeActive ? `${fmtDate(rangeStart!)} → ${fmtDate(rangeEnd!)}` : 'Date Range'}
          </Text>
          {rangeActive && (
            <TouchableOpacity onPress={clearRange} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {rangeActive && (
        <RangeSummary counts={{ present: meta.approved, absent: meta.rejected, na: meta.pending }} startDate={rangeStart!} endDate={rangeEnd!} onClear={clearRange} />
      )}

      {!rangeActive && (
        <>
          <MonthNavigator month={viewMonth} year={viewYear} onPrev={prevMonth} onNext={nextMonth} disableNext={isFutureMonth} />
          <View style={styles.statsRow}>
            <StatCard label="All" count={monthCounts.all} color={theme.colors.primary} icon="calendar-check" active={filter === 'all'} onPress={() => setFilter('all')} />
            <StatCard label="Pending" count={monthCounts.pending} color="#d97706" icon="clock-fast" active={filter === 'pending'} onPress={() => setFilter('pending')} />
            <StatCard label="Approved" count={monthCounts.approved} color="#16a34a" icon="check-circle" active={filter === 'approved'} onPress={() => setFilter('approved')} />
            <StatCard label="Rejected" count={monthCounts.rejected} color="#dc2626" icon="close-octagon" active={filter === 'rejected'} onPress={() => setFilter('rejected')} />
          </View>
        </>
      )}

      <Text style={styles.listTitle}>{meta.total} Records</Text>
    </View>
  ), [meta, filter, viewMonth, viewYear, rangeActive, rangeStart, rangeEnd, isFutureMonth]);

  const ListEmpty = useMemo(() => (
    loading ? null : (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No attendance records found</Text>
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
        <Text style={styles.footerText}>No more records</Text>
      </View>
    ) : null
  ), [loadingMore, meta.hasNextPage, listDays.length]);

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={styles.root}>
      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

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
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  headerTitle: { color: theme.colors.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  rangeTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.border,
    maxWidth: width - 160,
  },
  rangeTriggerActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  rangeTriggerText: { color: theme.colors.primary, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  listTitle: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14 },
  footer: { alignItems: 'center', paddingVertical: 16 },
  footerText: { color: theme.colors.textSecondary, fontSize: 12 },
  loadingOverlay: { position: 'absolute', top: 12, right: 20, zIndex: 10 },
});
