// app/(employee)/(tabs)/attendance.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../theme/index';
import { formatTimeIST, getISTDate, toYMD } from '@/utils/timeHelpers';
import { AttendanceApiRecord, fmtDate, generateAttendance, parseAttendanceRecords, toDateObj } from '@/utils/attendanceHelpers';
import { AttendanceRecord, AttendanceMeta, getAttendance } from '@/services/employees/attendance.service';
import DayCard, { DayCardPunch } from '@/components/company/attendance/DayCard';
import RangeSummary from '@/components/employees/attendance_list/RangeSummary';
import MonthNavigator from '@/components/common/MonthNavigator';
import StatCard from '@/components/common/StatCard';
import DateRangeModal from '@/components/employees/attendance_list/DateRangeModal';

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const today = getISTDate();

  // Month view state
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Date range state
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());

  // Data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [meta, setMeta] = useState<AttendanceMeta>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);

  const attendanceByDate = useMemo(() => parseAttendanceRecords(attendanceRecords as any), [attendanceRecords]);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const isFutureMonth = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  const normalizeStatus = (value?: string): 'approved' | 'rejected' | 'pending' => {
    const status = String(value ?? '').trim().toLowerCase();
    if (status === 'approved' || status === 'rejected' || status === 'pending') return status;
    return 'pending';
  };

  const dominantStatus = (punches: DayCardPunch[]): 'approved' | 'rejected' | 'pending' => {
    if (punches.some(p => p.status === 'pending')) return 'pending';
    if (punches.some(p => p.status === 'rejected')) return 'rejected';
    return 'approved';
  };

  const loadAttendance = useCallback(async (
    status: typeof filter,
    startDate?: string,
    endDate?: string,
  ) => {
    try {
      setLoading(true);
      const res = await getAttendance({ status, startDate, endDate });
      setAttendanceRecords(res?.data ?? []);
      if (res?.meta) setMeta(res.meta);
    } catch (e) {
      console.log('load attendance error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when month or filter changes (no range active)
  useEffect(() => {
    if (rangeStart && rangeEnd) return;
    const start = new Date(viewYear, viewMonth, 1);
    const end = new Date(viewYear, viewMonth + 1, 0);
    loadAttendance(filter, toYMD(start), toYMD(end));
  }, [viewYear, viewMonth, filter]);

  // Reload when range changes
  useEffect(() => {
    if (rangeStart && rangeEnd) {
      loadAttendance(filter, toYMD(rangeStart), toYMD(rangeEnd));
    }
  }, [rangeStart, rangeEnd, filter]);

  useFocusEffect(
    useCallback(() => {
      if (rangeStart && rangeEnd) {
        loadAttendance(filter, toYMD(rangeStart), toYMD(rangeEnd));
      } else {
        const start = new Date(viewYear, viewMonth, 1);
        const end = new Date(viewYear, viewMonth + 1, 0);
        loadAttendance(filter, toYMD(start), toYMD(end));
      }
    }, [viewYear, viewMonth, rangeStart, rangeEnd, filter, loadAttendance])
  );

  const monthCounts = useMemo(() => ({
    all: meta.total,
    pending: meta.pending,
    approved: meta.approved,
    rejected: meta.rejected,
  }), [meta]);

  const listDays = useMemo(() => {
    const dayMap: Record<number, { date: Date; punches: DayCardPunch[]; employeeName?: string; employeeCode?: string }> = {};
    
    attendanceRecords.forEach(r => {
      const recDate = new Date(r.CheckInTime || r.CreatedAt);
      const year = recDate.getFullYear();
      const month = recDate.getMonth();
      const d = recDate.getDate();
      
      if (year === viewYear && month === viewMonth) {
        if (!dayMap[d]) {
          dayMap[d] = { date: toDateObj(viewYear, viewMonth, d), punches: [] };
        }

        const checkIn = formatTimeIST(r.CheckInTime);
        const checkOut = r.CheckOutTime ? formatTimeIST(r.CheckOutTime) : null;

        dayMap[d].punches.push({
          checkIn,
          checkOut,
          address: r.Address,
          dynamicAddress: r.DynamicAddress,
          checkInImg: (r as any).CheckInSelfieUrl || undefined,
          checkOutImg: (r as any).CheckOutSelfieUrl || undefined,
          status: normalizeStatus((r as any).Status),
          attendanceId: r.AttendanceId,
          remarks: r.Remarks,
        });

        if (!dayMap[d].employeeName) {
          (dayMap[d] as any).employeeName = r.EmployeeName;
          (dayMap[d] as any).employeeCode = r.EmployeeCode;
        }
      }
    });

    return Object.entries(dayMap)
      .map(([d, val]) => {
        const dayNum = parseInt(d);
        
        if (filter === 'all') {
          return { day: dayNum, ...val };
        }

        const matchingPunches = val.punches.filter(p => p.status === filter);
        if (matchingPunches.length === 0) return null;

        return { day: dayNum, ...val, punches: matchingPunches };
      })
      .filter((item): item is any => item !== null)
      .sort((a, b) => b.day - a.day);
  }, [attendanceRecords, viewYear, viewMonth, filter]);

  // Range logic
  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return [];
    const days: { date: Date; status: any; punches: any[] }[] = [];
    const cur = new Date(rangeStart);
    while (cur <= rangeEnd) {
      const y = cur.getFullYear(), m = cur.getMonth(), d = cur.getDate();
      const key = `${y}-${m}-${d}`;
      const dayData = attendanceByDate[key];
      const status = dayData?.status ?? generateAttendance(y, m)[d] ?? 'na';
      const punches = dayData?.punches ?? [];
      
      days.push({ date: new Date(cur), status, punches });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [rangeStart, rangeEnd, attendanceByDate]);

  const rangeCounts = useMemo(() => {
    let present = 0, absent = 0, na = 0;
    rangeDays.forEach(({ status }) => {
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else na++;
    });
    return { present, absent, na };
  }, [rangeDays]);

  const filteredRangeDays = useMemo(() =>
    rangeDays
      .map(item => {
        if (filter === 'all') {
          return item;
        }

        const matchingPunches = item.punches.filter((p: any) => p.status === filter);
        if (matchingPunches.length === 0 && item.status !== filter) return null;

        return { ...item, punches: matchingPunches };
      })
      .filter((item): item is any => item !== null)
      .reverse(),
  [rangeDays, filter]);

  const rangeActive = !!(rangeStart && rangeEnd);

  // Handlers
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isFutureMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const openPicker = () => {
    setPickerYear(today.getFullYear());
    setPickerMonth(today.getMonth());
    setPickingEnd(false);
    setShowRangePicker(true);
  };

  const handlePickerDay = useCallback((d: Date) => {
    if (!pickingEnd) {
      setRangeStart(d);
      setRangeEnd(null);
      setPickingEnd(true);
    } else {
      if (rangeStart && d < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(d);
      } else {
        setRangeEnd(d);
      }
      setPickingEnd(false);
    }
  }, [pickingEnd, rangeStart]);

  const applyRange = () => {
    if (rangeStart && rangeEnd) {
      loadAttendance(filter, toYMD(rangeStart), toYMD(rangeEnd));
      setShowRangePicker(false);
    }
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
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    setRangeStart(start);
    setRangeEnd(today);
    setPickingEnd(false);
    setShowRangePicker(false);
  };
  const selectLast30Days = () => {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    setRangeStart(start);
    setRangeEnd(today);
    setPickingEnd(false);
    setShowRangePicker(false);
  };

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={styles.root}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <TouchableOpacity
            onPress={openPicker}
            style={[styles.rangeTrigger, rangeActive && styles.rangeTriggerActive]}
          >
            <MaterialCommunityIcons
              name="calendar-range"
              size={18}
              color={rangeActive ? theme.colors.white : theme.colors.primary}
            />
            <Text style={[styles.rangeTriggerText, rangeActive && { color: theme.colors.white }]}>
              {rangeActive
                ? `${fmtDate(rangeStart!)} → ${fmtDate(rangeEnd!)}`
                : 'Date Range'}
            </Text>
            {rangeActive && (
              <TouchableOpacity onPress={clearRange} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Range Summary */}
        {rangeActive && (
          <RangeSummary
            counts={rangeCounts}
            startDate={rangeStart!}
            endDate={rangeEnd!}
            onClear={clearRange}
          />
        )}

        {/* Month Navigator & Calendar (only if no range active) */}
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
              <StatCard label="All" count={monthCounts.all} color={theme.colors.primary}
                icon="calendar-check" active={filter === 'all'} onPress={() => setFilter('all')} />
              <StatCard label="Pending" count={monthCounts.pending} color="#d97706"
                icon="clock-fast" active={filter === 'pending'} onPress={() => setFilter('pending')} />
              <StatCard label="Approved" count={monthCounts.approved} color="#16a34a"
                icon="check-circle" active={filter === 'approved'} onPress={() => setFilter('approved')} />
              <StatCard label="Rejected" count={monthCounts.rejected} color="#dc2626"
                icon="close-octagon" active={filter === 'rejected'} onPress={() => setFilter('rejected')} />
            </View>
          </>
        )}

        {/* List Title */}
        <Text style={styles.listTitle}>
          {rangeActive ? `${filteredRangeDays.length} Records` : 'Daily Records'}
        </Text>

        {/* Attendance List */}
        <View style={styles.list}>
          {(rangeActive ? filteredRangeDays : listDays).map((item: any, i) => {
            const firstPunch = item.punches?.[0];
            return (
              <DayCard
                key={i}
                date={item.date}
                punches={item.punches}
                employeeName={item.employeeName}
                employeeCode={item.employeeCode}
                status={dominantStatus(item.punches)}
                onStatusUpdated={() => {
                  const start = rangeStart && rangeEnd ? toYMD(rangeStart) : toYMD(new Date(viewYear, viewMonth, 1));
                  const end = rangeStart && rangeEnd ? toYMD(rangeEnd) : toYMD(new Date(viewYear, viewMonth + 1, 0));
                  loadAttendance(filter, start, end);
                }}
              />
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Date Range Modal */}
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
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
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
  list: { gap: 6 },
  listTitle: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },
  loadingOverlay: { position: 'absolute', top: 12, right: 20, zIndex: 10 },
});
