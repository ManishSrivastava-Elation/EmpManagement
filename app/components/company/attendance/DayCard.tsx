// app/components/company/attendance/CompanyDayCard.tsx
import { updateCompanyAttendanceStatus } from '@/services/employees/attendance.service';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isToday = (date: Date) => {
  const t = new Date();
  return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
};

const STATUS_COLOR = { approved: '#22c55e', pending: '#f59e0b', rejected: '#ef4444' };
const STATUS_ICON = { approved: 'check-circle', pending: 'clock-outline', rejected: 'close-circle' };
const ALL_STATUSES: ('approved' | 'pending' | 'rejected')[] = ['approved', 'pending', 'rejected'];

export interface DayCardPunch {
  checkIn: string;
  checkOut?: string | null;
  address?: string;
  dynamicAddress?: string;
  checkInImg?: string;
  checkOutImg?: string;
  status?: 'approved' | 'rejected' | 'pending';
  attendanceId?: number;
  remarks?: string;
}

export interface DayCardProps {
  date: Date;
  punches?: DayCardPunch[];
  employeeName?: string;
  employeeCode?: string;
  status?: 'approved' | 'rejected' | 'pending';
  onStatusUpdated?: () => void;
}

function StatusDropdown({ current, attendanceId, onUpdated }: {
  current: 'approved' | 'pending' | 'rejected';
  attendanceId: number;
  onUpdated: (s: 'approved' | 'pending' | 'rejected') => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropPos, setDropPos] = useState({ x: 0, y: 0, w: 0 });
  const badgeRef = React.useRef<View>(null);
  const color = STATUS_COLOR[current];

  const handleOpen = () => {
    badgeRef.current?.measure((_fx, _fy, w, h, px, py) => {
      setDropPos({ x: px, y: py + h + 4, w });
      setOpen(true);
    });
  };

  const handleSelect = async (s: 'approved' | 'pending' | 'rejected') => {
    if (s === current) { setOpen(false); return; }
    setOpen(false);

    const verb = s === 'approved' ? 'Approve' : s === 'rejected' ? 'Reject' : 'Mark as Pending';
    const confirmMsg = s === 'rejected'
      ? 'This will mark the attendance as rejected. Are you sure?'
      : s === 'approved'
        ? 'This will mark the attendance as approved. Are you sure?'
        : 'This will set the attendance back to pending.';

    Alert.alert(
      `${verb} attendance?`,
      confirmMsg,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: verb,
          style: s === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await updateCompanyAttendanceStatus(attendanceId, s);
              onUpdated(s);
              Alert.alert('Success', res?.message || `Attendance ${s} successfully.`);
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message || 'Failed to update status. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View>
      <TouchableOpacity
        ref={badgeRef}
        style={[styles.dropBadge, { backgroundColor: color + '20' }]}
        onPress={handleOpen}
        disabled={loading}
      >
        <MaterialCommunityIcons name={STATUS_ICON[current] as any} size={12} color={color} />
        <Text style={[styles.dropText, { color }]}>{current.charAt(0).toUpperCase() + current.slice(1)}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={10} color={color} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.dropOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.dropdown, { top: dropPos.y, right: Dimensions.get('window').width - dropPos.x - dropPos.w }]}>
            {ALL_STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.dropItem, s === current && styles.dropItemActive]}
                onPress={() => handleSelect(s)}
              >
                <MaterialCommunityIcons name={STATUS_ICON[s] as any} size={13} color={STATUS_COLOR[s]} />
                <Text style={[styles.dropItemText, { color: STATUS_COLOR[s] }]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const PunchDetail: React.FC<{
  punch: DayCardPunch;
  color: string;
  onUpdated?: (s: 'approved' | 'pending' | 'rejected') => void;
}> = ({ punch, color, onUpdated }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <View style={styles.punchCard}>
      <View style={styles.punchHeader}>
        <View style={{ flex: 1 }}>
          {punch.address ? <Text style={styles.address} numberOfLines={1}>🏢 {punch.address}</Text> : null}
          {punch.dynamicAddress ? <Text style={styles.dynamicAddress}>📡 {punch.dynamicAddress}</Text> : null}
          {punch.remarks ? <Text style={styles.remark} numberOfLines={1}>💬 {punch.remarks}</Text> : null}
        </View>
        {punch.attendanceId ? (
          <StatusDropdown
            current={punch.status || 'pending'}
            attendanceId={punch.attendanceId}
            onUpdated={s => onUpdated?.(s)}
          />
        ) : null}
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Check‑in</Text>
          <Text style={styles.timeValue}>{punch.checkIn}</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Check‑out</Text>
          <Text style={styles.timeValue}>{punch.checkOut || 'Active'}</Text>
        </View>
      </View>

      {(punch.checkInImg || punch.checkOutImg) && (
        <View style={styles.imageRow}>
          {punch.checkInImg ? (
            <TouchableOpacity style={styles.imageBtn} onPress={() => { setSelectedImage(punch.checkInImg!); setModalVisible(true); }}>
              <Ionicons name="camera-outline" size={15} color={color} />
              <Text style={[styles.imageText, { color }]}>Check‑in Photo</Text>
            </TouchableOpacity>
          ) : null}
          {punch.checkOutImg ? (
            <TouchableOpacity style={styles.imageBtn} onPress={() => { setSelectedImage(punch.checkOutImg!); setModalVisible(true); }}>
              <Ionicons name="camera-outline" size={15} color={color} />
              <Text style={[styles.imageText, { color }]}>Check‑out Photo</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" /> : null}
        </View>
      </Modal>
    </View>
  );
};

export default function DayCard({
  date, punches: initialPunches = [],
  employeeName, employeeCode,
  status: initialStatus = 'pending',
  onStatusUpdated,
}: DayCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [punches, setPunches] = useState(initialPunches);
  const [status, setStatus] = useState(initialStatus);

  React.useEffect(() => {
    setPunches(initialPunches);
    setStatus(initialStatus);
  }, [initialPunches, initialStatus]);

  const borderColor = STATUS_COLOR[status] || '#3B82F6';
  const punchesCount = punches.length;
  const today = isToday(date);

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={() => punchesCount > 0 && setExpanded(e => !e)}
        activeOpacity={punchesCount > 0 ? 0.7 : 1}
      >
        <View style={[styles.dateBlock, { backgroundColor: borderColor + '15' }]}>
          <Text style={[styles.dateNum, { color: borderColor }]}>{date.getDate()}</Text>
          <Text style={[styles.dateDow, { color: borderColor }]}>{DAYS[date.getDay()]}</Text>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.userRow}>
            {employeeName ? <Text style={styles.userName} numberOfLines={1}>{employeeName}</Text> : null}
            {employeeCode ? <Text style={styles.empCode}>{employeeCode}</Text> : null}
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.monthYear}>{MONTH_SHORT[date.getMonth()]} {date.getFullYear()}</Text>
            {today && <View style={styles.todayBadge}><Text style={styles.todayText}>Today</Text></View>}
          </View>
          {punchesCount > 0 ? (
            <View style={styles.punchCountBadge}>
              <MaterialCommunityIcons name="clock-outline" size={12} color={borderColor} />
              <Text style={[styles.punchCountText, { color: borderColor }]}>
                {punchesCount} {punchesCount === 1 ? 'punch' : 'punches'}
              </Text>
            </View>
          ) : <Text style={styles.subText}>No check-in recorded</Text>}
        </View>

        <View style={styles.rightCol}>
          <View style={[styles.statusBadge, { backgroundColor: borderColor + '15' }]}>
            <MaterialCommunityIcons name={STATUS_ICON[status] as any} size={13} color={borderColor} />
            <Text style={[styles.statusBadgeText, { color: borderColor }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
          {punchesCount > 0 ? <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={borderColor} /> : null}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContainer}>
          {punches.map((p, i) => (
            <PunchDetail
              key={i}
              punch={p}
              color={borderColor}
              onUpdated={newStatus => {
                const updated = punches.map(item =>
                  item.attendanceId === p.attendanceId ? { ...item, status: newStatus } : item
                );
                setPunches(updated);
                setStatus(updated[0]?.status || newStatus);
                onStatusUpdated?.();
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1, borderColor: theme.colors.border,
    borderLeftWidth: 4, overflow: 'hidden',
    shadowColor: theme.colors.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 12 },
  dateBlock: { width: 44, height: 48, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center' },
  dateNum: { fontSize: 20, fontWeight: '800' },
  dateDow: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  cardInfo: { flex: 1, gap: 2 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  empCode: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '500' },
  dateRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    marginTop: 2,
  },
  monthYear: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '500' },
  todayBadge: {
    backgroundColor: '#eff6ff', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  todayText: { color: theme.colors.primary, fontSize: 9, fontWeight: '700' },
  punchCountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  punchCountText: { fontSize: 11, fontWeight: '600' },
  subText: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  expandedContainer: {
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingBottom: 12,
  },
  punchCard: {
    backgroundColor: theme.colors.white, borderRadius: theme.radius.sm,
    padding: 10, marginTop: 10, borderWidth: 1, borderColor: theme.colors.border,
    shadowColor: theme.colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02, shadowRadius: 3, elevation: 1,
  },
  punchHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, gap: 10 },
  address: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  dynamicAddress: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 },
  remark: { fontSize: 10, color: theme.colors.primary, fontStyle: 'italic', marginTop: 2 },
  timeRow: { flexDirection: 'row', gap: 16, marginTop: 4, marginBottom: 4 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 10, color: theme.colors.textSecondary, marginBottom: 2 },
  timeValue: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  imageRow: { flexDirection: 'row', gap: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  imageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  imageText: { fontSize: 11, fontWeight: '600' },
  dropBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  dropText: { fontSize: 10, fontWeight: '700' },
  dropOverlay: { flex: 1 },
  dropdown: {
    position: 'absolute', backgroundColor: '#fff', borderRadius: 12, padding: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12,
    shadowRadius: 12, elevation: 20, borderWidth: 1, borderColor: '#f0f0f0', minWidth: 140,
  },
  dropItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  dropItemActive: { backgroundColor: '#f3f4f6' },
  dropItemText: { fontSize: 13, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  modalImage: { width, height: height * 0.8 },
});