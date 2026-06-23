import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { updateExpenseStatus, ExpenseStatus } from '@/services/company/expense.service';
import { baseImageUrl } from '@/api/apis';
import { theme } from '@/theme';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const STATUS_COLOR: Record<ExpenseStatus, string> = {
  approved: '#22c55e',
  pending:  '#f59e0b',
  rejected: '#ef4444',
  paid:     '#3b82f6',
};

const STATUS_ICON: Record<ExpenseStatus, string> = {
  approved: 'check-circle',
  pending:  'clock-outline',
  rejected: 'close-circle',
  paid:     'cash-check',
};

const ALL_STATUSES: ExpenseStatus[] = ['approved', 'pending', 'rejected', 'paid'];

export interface ExpenseItem {
  ExpenseId: number;
  ExpenseDate: string;
  Title: string;
  Description: string;
  Amount: string;
  Status: ExpenseStatus;
  ReceiptUrl?: string;
}

export interface ExpenseCardProps {
  date: Date;
  expenses: ExpenseItem[];
  employeeName?: string;
  onStatusUpdated?: () => void;
  readOnly?: boolean;
}

function getFullImageUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${baseImageUrl}${path}`;
}

function BillImageModal({ uri, onClose }: { uri: string; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.modalBg}>
        <TouchableOpacity style={styles.modalClose} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri }} style={styles.modalImage} resizeMode="contain" />
      </View>
    </Modal>
  );
}

function ConfirmModal({
  visible, title, message, confirmText, confirmColor, icon, iconColor, loading, onConfirm, onCancel,
}: {
  visible: boolean; title: string; message: string;
  confirmText?: string; confirmColor?: string; icon?: string;
  iconColor?: string; loading?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmBox}>
          {icon && (
            <View style={[styles.confirmIconWrap, { backgroundColor: (iconColor ?? confirmColor ?? '#4b5563') + '15' }]}>
              <MaterialCommunityIcons name={icon as any} size={32} color={iconColor ?? confirmColor} />
            </View>
          )}
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <View style={styles.confirmBtnRow}>
            <TouchableOpacity style={styles.confirmCancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmOkBtn, { backgroundColor: confirmColor ?? '#4b5563' }]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmOkText}>{loading ? 'Updating...' : (confirmText ?? 'Confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function StatusDropdown({ current, expenseId, onUpdated }: {
  current: ExpenseStatus;
  expenseId: number;
  onUpdated: (newStatus: ExpenseStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropPos, setDropPos] = useState({ x: 0, y: 0, w: 0 });
  const [confirmStatus, setConfirmStatus] = useState<ExpenseStatus | null>(null);
  const badgeRef = useRef<View>(null);
  const color = STATUS_COLOR[current];

  const handleOpen = () => {
    badgeRef.current?.measure((_fx, _fy, w, h, px, py) => {
      setDropPos({ x: px, y: py + h + 4, w });
      setOpen(true);
    });
  };

  const handleSelect = (status: ExpenseStatus) => {
    if (status === current) { setOpen(false); return; }
    setOpen(false);
    setConfirmStatus(status);
  };

  const handleConfirm = async () => {
    if (!confirmStatus) return;
    try {
      setLoading(true);
      await updateExpenseStatus(expenseId, confirmStatus);
      onUpdated(confirmStatus);
    } catch {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
      setConfirmStatus(null);
    }
  };

  return (
    <View>
      <TouchableOpacity
        ref={badgeRef}
        style={[styles.dropdownBadge, { backgroundColor: color + '20' }]}
        onPress={handleOpen}
        disabled={loading}
      >
        <MaterialCommunityIcons name={STATUS_ICON[current] as any} size={12} color={color} />
        <Text style={[styles.dropdownText, { color }]}>
          {current.charAt(0).toUpperCase() + current.slice(1)}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={10} color={color} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.dropdown, { top: dropPos.y, right: Dimensions.get('window').width - dropPos.x - dropPos.w }]}>
            {ALL_STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.dropdownItem, s === current && styles.dropdownItemActive]}
                onPress={() => handleSelect(s)}
              >
                <MaterialCommunityIcons name={STATUS_ICON[s] as any} size={13} color={STATUS_COLOR[s]} />
                <Text style={[styles.dropdownItemText, { color: STATUS_COLOR[s] }]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ConfirmModal
        visible={!!confirmStatus}
        title="Change Status?"
        message={`Mark this expense as ${confirmStatus ? confirmStatus.charAt(0).toUpperCase() + confirmStatus.slice(1) : ''}?`}
        confirmText={loading ? 'Updating...' : 'Confirm'}
        confirmColor={confirmStatus ? STATUS_COLOR[confirmStatus] : '#4b5563'}
        icon={confirmStatus ? STATUS_ICON[confirmStatus] : 'help-circle'}
        iconColor={confirmStatus ? STATUS_COLOR[confirmStatus] : '#6b7280'}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmStatus(null)}
      />
    </View>
  );
}

export default function ExpenseCard({ date, expenses, employeeName, onStatusUpdated, readOnly = false }: ExpenseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [localExpenses, setLocalExpenses] = useState(expenses);
  const [billImageUri, setBillImageUri] = useState<string | null>(null);

  React.useEffect(() => { setLocalExpenses(expenses); }, [JSON.stringify(expenses)]);

  const totalAmount = localExpenses.reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0);
  const hasPending  = localExpenses.some(e => e.Status === 'pending');
  const hasRejected = localExpenses.some(e => e.Status === 'rejected');
  const hasPaid     = localExpenses.some(e => e.Status === 'paid');
  const borderColor = hasRejected ? '#ef4444' : hasPending ? '#f59e0b' : hasPaid ? '#3b82f6' : '#22c55e';

  const handleStatusUpdated = (expenseId: number, newStatus: ExpenseStatus) => {
    setLocalExpenses(prev => prev.map(e => e.ExpenseId === expenseId ? { ...e, Status: newStatus } : e));
    onStatusUpdated?.();
  };

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <TouchableOpacity style={styles.cardMain} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        <View style={[styles.dateBlock, { backgroundColor: borderColor + '22' }]}>
          <Text style={[styles.dateNum, { color: borderColor }]}>{date.getDate()}</Text>
          <Text style={[styles.dateDow, { color: borderColor }]}>{DAYS[date.getDay()]}</Text>
        </View>

        <View style={styles.cardInfo}>
          {!!employeeName && <Text style={styles.userName} numberOfLines={1}>{employeeName}</Text>}
          <Text style={styles.monthYear}>{MONTHS[date.getMonth()]} {date.getFullYear()}</Text>
          <View style={styles.countRow}>
            <MaterialCommunityIcons name="receipt-outline" size={12} color={borderColor} />
            <Text style={[styles.countText, { color: borderColor }]}>
              {localExpenses.length} expense{localExpenses.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={borderColor} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContainer}>
          {localExpenses.map((exp, i) => {
            const billUrl = (exp.ReceiptUrl && exp.ReceiptUrl !== 'null') ? getFullImageUrl(exp.ReceiptUrl) : null;
            const hasBill = !!billUrl && billUrl.length > 0;
            return (
              <View key={exp.ExpenseId} style={[styles.expandedPunchCard, i > 0 && { marginTop: 8 }]}>
                <View style={styles.punchHeader}>
                  <Text style={styles.expTitle}>{exp.Title}</Text>
                  {readOnly ? (
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[exp.Status] + '20' }]}>
                      <MaterialCommunityIcons name={STATUS_ICON[exp.Status] as any} size={12} color={STATUS_COLOR[exp.Status]} />
                      <Text style={[styles.statusBadgeText, { color: STATUS_COLOR[exp.Status] }]}>
                        {exp.Status.charAt(0).toUpperCase() + exp.Status.slice(1)}
                      </Text>
                    </View>
                  ) : (
                    <StatusDropdown
                      current={exp.Status}
                      expenseId={exp.ExpenseId}
                      onUpdated={(s) => handleStatusUpdated(exp.ExpenseId, s)}
                    />
                  )}
                </View>

                {!!exp.Description && <Text style={styles.expandedRemark}>{exp.Description}</Text>}

                <View style={styles.expandedTimeRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>Amount</Text>
                    <Text style={styles.timeValue}>₹{(parseFloat(exp.Amount) || 0).toFixed(2)}</Text>
                  </View>
                  <View style={styles.timeBlock}>
                    {hasBill ? (
                      <TouchableOpacity style={styles.expandedImageBtn} onPress={() => setBillImageUri(billUrl!)}>
                        <Ionicons name="image-outline" size={14} color="#4b5563" />
                        <Text style={styles.expandedImageText}>View Bill</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.noBillBadge}>
                        <Text style={styles.noBillText}>No Bill</Text>
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  dateBlock: { width: 44, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dateNum: { fontSize: 20, fontWeight: '800' },
  dateDow: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  cardInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 12, fontWeight: '600', color: '#374151' },
  monthYear: { fontSize: 13, fontWeight: '700', color: '#1f2937' },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  countText: { fontSize: 11, fontWeight: '600' },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  totalAmount: { fontSize: 15, fontWeight: '800', color: '#111827' },
  expandedContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  expandedPunchCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 9,
    marginTop: 8,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  punchHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0, gap: 10 },
  expTitle: { fontSize: 13, fontWeight: '700', color: '#1f2937', flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  dropdownBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  dropdownText: { fontSize: 10, fontWeight: '700' },
  dropdownOverlay: { flex: 1 },
  dropdown: {
    position: 'absolute',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 6,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minWidth: 140,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  dropdownItemActive: { backgroundColor: '#f3f4f6' },
  dropdownItemText: { fontSize: 13, fontWeight: '600' },
  expandedRemark: { fontSize: 10, color: '#6366f1', fontStyle: 'italic', marginBottom: 6 },
  expandedTimeRow: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 10, color: '#9ca3af', marginBottom: 2 },
  timeValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  expandedImageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
  expandedImageText: { fontSize: 12, fontWeight: '600', color: '#4b5563' },
  noBillBadge: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f9fafb', borderRadius: 20, alignSelf: 'flex-start' },
  noBillText: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  modalImage: { width: '100%', height: '80%' },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  confirmBox: {
    backgroundColor: theme.colors.white, borderRadius: 24, padding: 28,
    alignItems: 'center', width: '100%',
    shadowColor: theme.colors.black, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
  },
  confirmIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  confirmTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  confirmMessage: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  confirmBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmCancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center', backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  confirmCancelText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  confirmOkBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  confirmOkText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
