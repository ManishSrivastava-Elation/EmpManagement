// components/employees/attendance_list/DateRangeModal.tsx
import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { fmtDate } from '../../../utils/attendanceHelpers';
import MiniCalendar from './MiniCalendar';

interface DateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  pickingEnd: boolean;
  pickerYear: number;
  pickerMonth: number;
  onPickerYearMonthChange: (y: number, m: number) => void;
  onDayPress: (date: Date) => void;
  onClearRange: () => void;
  onApply: () => void;
  today: Date;
  onThisMonth: () => void;
  onLast7Days: () => void;
  onLast30Days: () => void;
}

export default function DateRangeModal({
  visible,
  onClose,
  rangeStart,
  rangeEnd,
  pickingEnd,
  pickerYear,
  pickerMonth,
  onPickerYearMonthChange,
  onDayPress,
  onClearRange,
  onApply,
  today,
  onThisMonth,
  onLast7Days,
  onLast30Days,
}: DateRangeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
          <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.modalInner}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Date Range</Text>
                <Text style={styles.modalSubtitle}>
                  {!rangeStart
                    ? 'Tap a start date'
                    : pickingEnd
                      ? 'Now tap an end date'
                      : `${fmtDate(rangeStart)}  →  ${rangeEnd ? fmtDate(rangeEnd) : '...'}`}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.chipRow}>
              <View style={[styles.chip, !pickingEnd && styles.chipActive]}>
                <MaterialCommunityIcons
                  name="calendar-start"
                  size={14}
                  color={!pickingEnd ? theme.colors.white : theme.colors.textSecondary}
                />
                <Text style={[styles.chipText, !pickingEnd && styles.chipTextActive]}>
                  {rangeStart ? fmtDate(rangeStart) : 'Start Date'}
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={theme.colors.textSecondary}
                style={{ marginHorizontal: 6 }}
              />
              <View style={[styles.chip, pickingEnd && styles.chipActive]}>
                <MaterialCommunityIcons
                  name="calendar-end"
                  size={14}
                  color={pickingEnd ? theme.colors.white : theme.colors.textSecondary}
                />
                <Text style={[styles.chipText, pickingEnd && styles.chipTextActive]}>
                  {rangeEnd ? fmtDate(rangeEnd) : 'End Date'}
                </Text>
              </View>
            </View>

            <MiniCalendar
              year={pickerYear}
              month={pickerMonth}
              onYearMonthChange={onPickerYearMonthChange}
              selectedStart={rangeStart}
              selectedEnd={rangeEnd}
              onDayPress={onDayPress}
              pickingEnd={pickingEnd}
            />

            <View style={styles.presetRow}>
              <TouchableOpacity style={styles.presetBtn} onPress={onThisMonth}>
                <Text style={styles.presetText}>This Month</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetBtn} onPress={onLast7Days}>
                <Text style={styles.presetText}>Last 7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetBtn} onPress={onLast30Days}>
                <Text style={styles.presetText}>Last 30 Days</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={onApply}
              disabled={!rangeStart || !rangeEnd}
              activeOpacity={0.85}
              style={[styles.applyBtn, (!rangeStart || !rangeEnd) && { opacity: 0.4 }]}
            >
              <LinearGradient colors={[theme.colors.primary, '#1d4ed8']} style={styles.applyBtnInner}>
                <Text style={styles.applyBtnText}>Apply Range</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, overflow: 'hidden' },
  modalInner: { padding: 20, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { color: theme.colors.text, fontSize: 18, fontWeight: theme.fontWeight.bold },
  modalSubtitle: { color: theme.colors.primary, fontSize: 12, marginTop: 3, fontWeight: theme.fontWeight.medium },
  modalCloseBtn: { padding: 6, backgroundColor: '#f1f5f9', borderRadius: theme.radius.sm },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600', flex: 1 },
  chipTextActive: { color: theme.colors.white },
  presetRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 16 },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  presetText: { color: theme.colors.primary, fontSize: 11, fontWeight: '700' },
  applyBtn: { borderRadius: theme.radius.full, overflow: 'hidden' },
  applyBtnInner: { paddingVertical: 14, alignItems: 'center' },
  applyBtnText: { color: theme.colors.white, fontSize: 15, fontWeight: theme.fontWeight.bold, letterSpacing: 0.4 },
});
