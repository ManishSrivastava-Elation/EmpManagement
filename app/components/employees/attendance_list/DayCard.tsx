// components/employees/attendance_list/DayCard.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../theme';
import { baseImageUrl } from '@/api/apis';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isToday = (date: Date) => {
  const t = new Date();
  return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
};

const STATUS_COLOR = {
  approved: '#22c55e',
  pending: '#f59e0b',
  rejected: '#ef4444',
  absent: '#6b7280',
  na: '#6b7280',
};

const STATUS_ICON = {
  approved: 'check-circle',
  pending: 'clock-outline',
  rejected: 'close-circle',
  absent: 'minus-circle-outline',
  na: 'minus-circle-outline',
};

export interface DayCardPunch {
  checkIn: string;
  checkOut?: string | null;
  address?: string;
  dynamicAddress?: string;
  checkInImg?: string;
  checkOutImg?: string;
  status?: 'approved' | 'rejected' | 'pending' | 'absent' | 'na';
  remarks?: string;
}

export interface DayCardProps {
  date: Date;
  punches?: DayCardPunch[];
  borderColor?: string;
  status?: 'approved' | 'rejected' | 'pending' | 'absent' | 'na';
}

const PunchDetail: React.FC<{
  punch: DayCardPunch;
  color: string;
}> = ({ punch, color }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const viewPhoto = (uri: string) => {
    setSelectedImage(`${baseImageUrl}${uri}`);
    setModalVisible(true);
  };

  const statusVal = punch.status || 'pending';

  return (
    <View style={styles.expandedPunchCard}>
      <View style={styles.punchHeader}>
        <View style={{ flex: 1 }}>
          {punch.address ? <Text style={styles.expandedAddress} numberOfLines={1}>🏢 {punch.address}</Text> : null}
          {punch.dynamicAddress ? <Text style={styles.expandedDynamicAddress}>📡 {punch.dynamicAddress}</Text> : null}
          {punch.remarks ? <Text style={styles.expandedRemark} numberOfLines={1}>💬 {punch.remarks}</Text> : null}
        </View>

        <View style={[styles.statusInfo, statusVal === 'approved' ? styles.approvedStatus : statusVal === 'rejected' ? styles.rejectedStatus : styles.pendingStatus]}>
          <MaterialCommunityIcons
            name={STATUS_ICON[statusVal] as any || 'clock-outline'}
            size={12}
            color={STATUS_COLOR[statusVal] || '#f59e0b'}
          />
          <Text style={[styles.statusInfoText, { color: STATUS_COLOR[statusVal] || '#f59e0b' }]}>
            {statusVal.charAt(0).toUpperCase() + statusVal.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.expandedTimeRow}>
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
        <View style={styles.expandedImageRow}>
          {punch.checkInImg ? (
            <TouchableOpacity style={styles.expandedImageBtn} onPress={() => viewPhoto(punch.checkInImg!)}>
              <Ionicons name="camera-outline" size={15} color={color} />
              <Text style={[styles.expandedImageText, { color }]}>Check‑in Photo</Text>
            </TouchableOpacity>
          ) : null}
          {punch.checkOutImg ? (
            <TouchableOpacity style={styles.expandedImageBtn} onPress={() => viewPhoto(punch.checkOutImg!)}>
              <Ionicons name="camera-outline" size={15} color={color} />
              <Text style={[styles.expandedImageText, { color }]}>Check‑out Photo</Text>
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
  date,
  punches = [],
  borderColor: borderColorProp,
  status = 'pending',
}: DayCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasActive = punches.some(p => !p.checkOut);
  const effectiveStatus = status || (hasActive ? 'pending' : 'approved');
  const derivedBorderColor = STATUS_COLOR[effectiveStatus] || (hasActive ? '#22c55e' : '#3B82F6');
  const borderColor = borderColorProp || derivedBorderColor;
  const punchesCount = punches.length;
  const today = isToday(date);
  const expandable = punchesCount > 0;

  const statusLabel = effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1);
  const statusIcon = STATUS_ICON[effectiveStatus] || 'clock-outline';

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={() => expandable && setExpanded(e => !e)}
        activeOpacity={expandable ? 0.7 : 1}
      >
        <View style={[styles.dateBlock, { backgroundColor: borderColor + '15' }]}>
          <Text style={[styles.dateNum, { color: borderColor }]}>{date.getDate()}</Text>
          <Text style={[styles.dateDow, { color: borderColor }]}>{DAYS[date.getDay()]}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.monthYear}>{MONTH_SHORT[date.getMonth()]} {date.getFullYear()}</Text>

          {today && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          )}

          {punchesCount > 0 ? (
            <View style={styles.punchCountBadge}>
              <MaterialCommunityIcons name="clock-outline" size={12} color={borderColor} />
              <Text style={[styles.punchCountText, { color: borderColor }]}>
                {punchesCount} {punchesCount === 1 ? 'punch' : 'punches'}
              </Text>
            </View>
          ) : (
            <Text style={styles.subText}>No check-in recorded</Text>
          )}
        </View>

        <View style={styles.rightCol}>
          <View style={[styles.statusBadge, { backgroundColor: borderColor + '15' }]}>
            <MaterialCommunityIcons name={statusIcon as any} size={13} color={borderColor} />
            <Text style={[styles.statusBadgeText, { color: borderColor }]}>{statusLabel}</Text>
          </View>
          {expandable ? (
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={borderColor} />
          ) : null}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContainer}>
          {punches.map((p, i) => (
            <PunchDetail
              key={i}
              punch={p}
              color={borderColor}
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
  cardMain: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  dateBlock: { width: 44, height: 48, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center' },
  dateNum: { fontSize: 20, fontWeight: '800' },
  dateDow: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  cardInfo: { flex: 1, gap: 2 },
  monthYear: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  todayBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  todayText: { color: theme.colors.primary, fontSize: 9, fontWeight: '700' },
  punchCountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  punchCountText: { fontSize: 11, fontWeight: '600' },
  subText: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  approvedStatus: { backgroundColor: '#f0fdf4' },
  rejectedStatus: { backgroundColor: '#fef2f2' },
  pendingStatus: { backgroundColor: '#fffbeb' },
  statusInfoText: { fontSize: 10, fontWeight: '700' },
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  punchHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, gap: 10 },
  expandedAddress: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  expandedDynamicAddress: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 },
  expandedRemark: { fontSize: 10, color: theme.colors.primary, fontStyle: 'italic', marginTop: 2 },
  expandedTimeRow: { flexDirection: 'row', gap: 16, marginTop: 8, marginBottom: 4 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 10, color: theme.colors.textSecondary, marginBottom: 2 },
  timeValue: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  expandedImageRow: { flexDirection: 'row', gap: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  expandedImageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expandedImageText: { fontSize: 11, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  modalImage: { width: width, height: height * 0.8 },
});
