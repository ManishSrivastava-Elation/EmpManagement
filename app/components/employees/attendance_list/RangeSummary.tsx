// components/employees/attendance_list/RangeSummary.tsx
import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { fmtDate, STATUS_CFG } from '../../../utils/attendanceHelpers';

interface RangeSummaryProps {
  counts: { present: number; absent: number; na: number };
  startDate: Date;
  endDate: Date;
  onClear: () => void;
}

export default function RangeSummary({ counts, startDate, endDate, onClear }: RangeSummaryProps) {
  const total = counts.present + counts.absent + counts.na;
  const pct = total > 0 ? Math.round((counts.present / total) * 100) : 0;

  return (
    <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.rangeSummary}>
      <View style={styles.rsTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rsTitle}>Date Range Summary</Text>
          <Text style={styles.rsDates}>{fmtDate(startDate)}  →  {fmtDate(endDate)}</Text>
        </View>
        <TouchableOpacity onPress={onClear} style={styles.rsClearBtn}>
          <Ionicons name="close" size={16} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      <View style={styles.rsBarBg}>
        <View style={[styles.rsBarFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.rsPct}>{pct}% Attendance Rate</Text>

      <View style={styles.rsCountRow}>
        {[
          { label: 'Present', val: counts.present, color: STATUS_CFG.present.color },
          { label: 'Absent', val: counts.absent, color: STATUS_CFG.absent.color },
          { label: 'N/A', val: counts.na, color: STATUS_CFG.na.color },
          { label: 'Total Days', val: total, color: theme.colors.primary },
        ].map((item, i) => (
          <View key={i} style={styles.rsCountItem}>
            <Text style={[styles.rsCountVal, { color: item.color }]}>{item.val}</Text>
            <Text style={styles.rsCountLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  rangeSummary: {
    borderRadius: theme.radius.lg,
    padding: 18,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  rsTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  rsTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  rsDates: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  rsClearBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: theme.radius.sm },
  rsBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  rsBarFill: { height: 8, backgroundColor: '#22c55e', borderRadius: 4 },
  rsPct: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 14 },
  rsCountRow: { flexDirection: 'row', justifyContent: 'space-around' },
  rsCountItem: { alignItems: 'center', gap: 2 },
  rsCountVal: { fontSize: 20, fontWeight: '800' },
  rsCountLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },
});
