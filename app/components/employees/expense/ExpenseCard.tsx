// components/employees/expense/ExpenseCard.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../theme';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

type Status = 'approved' | 'pending' | 'rejected' | 'paid';

const STATUS_COLOR: Record<Status, string> = {
  approved: '#22c55e',
  pending:  '#f59e0b',
  rejected: '#ef4444',
  paid:     '#3b82f6',
};

const STATUS_ICON: Record<Status, string> = {
  approved: 'check-circle',
  pending:  'clock-outline',
  rejected: 'close-circle',
  paid:     'cash-check',
};

export interface ExpenseItem {
  ExpenseId: number;
  ExpenseDate: string;
  Title: string;
  Description: string;
  Amount: string;
  Status: Status;
  ReceiptUrl?: string;
}

export interface ExpenseCardProps {
  date: Date;
  expenses: ExpenseItem[];
}

function BillImageModal({ uri, onClose }: { uri: string; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <TouchableOpacity style={styles.modalClose} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri }} style={styles.modalImage} resizeMode="contain" />
      </View>
    </Modal>
  );
}

export default function ExpenseCard({ date, expenses }: ExpenseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [billImageUri, setBillImageUri] = useState<string | null>(null);

  const totalAmount = expenses.reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0);
  const hasPending  = expenses.some(e => e.Status === 'pending');
  const hasRejected = expenses.some(e => e.Status === 'rejected');
  const hasPaid     = expenses.some(e => e.Status === 'paid');
  const borderColor = hasRejected ? '#ef4444' : hasPending ? '#f59e0b' : hasPaid ? '#3b82f6' : '#22c55e';

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <TouchableOpacity style={styles.cardMain} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        {/* Date block */}
        <View style={[styles.dateBlock, { backgroundColor: borderColor + '15' }]}>
          <Text style={[styles.dateNum, { color: borderColor }]}>{date.getDate()}</Text>
          <Text style={[styles.dateDow, { color: borderColor }]}>{DAYS[date.getDay()]}</Text>
        </View>

        {/* Info section */}
        <View style={styles.cardInfo}>
          <Text style={styles.monthYear}>{MONTHS[date.getMonth()]} {date.getFullYear()}</Text>
          <View style={styles.countRow}>
            <MaterialCommunityIcons name="receipt-outline" size={12} color={borderColor} />
            <Text style={[styles.countText, { color: borderColor }]}>
              {expenses.length} expense{expenses.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Right column */}
        <View style={styles.rightCol}>
          <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={borderColor} />
        </View>
      </TouchableOpacity>

      {/* Expanded section */}
      {expanded && (
        <View style={styles.expandedContainer}>
          {expenses.map((exp, i) => {
            const hasBill = !!exp.ReceiptUrl && exp.ReceiptUrl.length > 0;
            return (
              <View key={exp.ExpenseId} style={[styles.expandedPunchCard, i > 0 && { marginTop: 8 }]}>
                <View style={styles.punchHeader}>
                  <Text style={styles.expTitle}>{exp.Title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[exp.Status] + '15' }]}>
                    <MaterialCommunityIcons name={STATUS_ICON[exp.Status] as any} size={12} color={STATUS_COLOR[exp.Status]} />
                    <Text style={[styles.statusBadgeText, { color: STATUS_COLOR[exp.Status] }]}>
                      {exp.Status.charAt(0).toUpperCase() + exp.Status.slice(1)}
                    </Text>
                  </View>
                </View>

                {!!exp.Description && <Text style={styles.expandedRemark}>{exp.Description}</Text>}

                <View style={styles.expandedTimeRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>Amount</Text>
                    <Text style={styles.timeValue}>₹{(parseFloat(exp.Amount) || 0).toFixed(2)}</Text>
                  </View>
                  <View style={styles.timeBlock}>
                    {hasBill ? (
                      <TouchableOpacity style={styles.expandedImageBtn} onPress={() => setBillImageUri(exp.ReceiptUrl!)}>
                        <Ionicons name="image-outline" size={14} color={theme.colors.primary} />
                        <Text style={styles.expandedImageText}>View Bill</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.noBillBadge}>
                        <Text style={styles.noBillText}>No Bill Attached</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {billImageUri && <BillImageModal uri={billImageUri} onClose={() => setBillImageUri(null)} />}
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
    overflow: 'hidden',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  dateBlock: {
    width: 44,
    height: 48,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  dateDow: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  monthYear: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  expandedContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  expandedPunchCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,
    padding: 10,
    marginTop: 10,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  punchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 10,
  },
  expTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  expandedRemark: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 2,
  },
  expandedTimeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  expandedImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  expandedImageText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  noBillBadge: {
    alignSelf: 'flex-start',
  },
  noBillText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
});
