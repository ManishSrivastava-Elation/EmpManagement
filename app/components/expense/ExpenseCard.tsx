// components/expense/ExpenseCard.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@/theme';
import type { ApiExpense } from '@/services/employees/expense.service';

type Status = 'approved' | 'pending' | 'rejected' | 'paid';

const STATUS_COLOR: Record<Status, string> = {
  approved: '#22c55e',
  pending: '#f59e0b',
  rejected: '#ef4444',
  paid: '#2409f1',
};

const STATUS_ICON: Record<Status, string> = {
  approved: 'check-circle',
  pending: 'clock-outline',
  rejected: 'close-circle',
  paid: 'cash-check',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface ExpenseCardProps {
  item: ApiExpense;
  showEmployee?: boolean;
}

export default function ExpenseCard({ item, showEmployee = false }: ExpenseCardProps) {
  const status = (item.Status as Status) in STATUS_COLOR ? (item.Status as Status) : 'pending';
  const color = STATUS_COLOR[status];
  const date = new Date(item.ExpenseDate);

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      {/* Top row */}
      <View style={styles.row}>
        <View style={[styles.dateBlock, { backgroundColor: color + '18' }]}>
          <Text style={[styles.dateNum, { color }]}>{date.getDate()}</Text>
          <Text style={[styles.dateMon, { color }]}>{MONTHS[date.getMonth()]}</Text>
        </View>

        <View style={styles.info}>
          {showEmployee && !!item.EmployeeName && (
            <Text style={styles.employeeName} numberOfLines={1}>{item.EmployeeName}</Text>
          )}
          <Text style={styles.title} numberOfLines={1}>{item.Title}</Text>
          {!!item.Description && (
            <Text style={styles.desc} numberOfLines={1}>{item.Description}</Text>
          )}
        </View>

        <View style={styles.right}>
          <Text style={styles.amount}>₹{(parseFloat(item.Amount) || 0).toFixed(2)}</Text>
          <View style={[styles.badge, { backgroundColor: color + '18' }]}>
            <MaterialCommunityIcons name={STATUS_ICON[status] as any} size={11} color={color} />
            <Text style={[styles.badgeText, { color }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    padding: 12,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBlock: {
    width: 42,
    height: 46,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNum: { fontSize: 18, fontWeight: '800' },
  dateMon: { fontSize: 10, fontWeight: '600' },
  info: { flex: 1, gap: 2 },
  employeeName: { fontSize: 12, fontWeight: '700', color: theme.colors.primary },
  title: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  desc: { fontSize: 11, color: theme.colors.textSecondary },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
});
