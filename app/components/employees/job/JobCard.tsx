import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { JobItem } from '@/services/employees/job.service';
import { BLUE, DIVIDER_COLOR, ICON_BG, LABEL_COLOR, PRIORITY, VALUE_COLOR } from '@/components/company/jobs/constants';
import { formatDateTime } from '@/utils/timeHelpers';

const InfoField = memo(({ label, value }: { label: string; value: string }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue} numberOfLines={2}>{value || '—'}</Text>
  </View>
));

const SectionHeading = memo(({ icon, title }: { icon: string; title: string }) => (
  <View style={styles.sectionHead}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon as any} size={14} color={BLUE} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
));

const JobCard = memo(({ item }: { item: JobItem }) => {
  const router = useRouter();
  const priorityConfig = PRIORITY[item.priority] || PRIORITY.MEDIUM;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatarBox}>
          <Ionicons name="briefcase" size={24} color={BLUE} />
        </View>
        <View style={styles.cardTopCenter}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.job_title}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.bg }]}>
              <View style={[styles.dot, { backgroundColor: priorityConfig.color }]} />
              <Text style={[styles.priorityText, { color: priorityConfig.color }]}>{priorityConfig.label}</Text>
            </View>
            {item.status && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <SectionHeading icon="person" title="Customer Details" />
      <View style={styles.fieldRow}>
        <InfoField label="Customer Name" value={item.customer_name} />
        <InfoField label="Phone" value={item.phone} />
      </View>

      <View style={styles.divider} />

      <SectionHeading icon="document-text" title="Job Information" />
      {!!item.description?.trim() && (
        <View style={styles.descContainer}>
          <Text style={styles.fieldLabel}>Description</Text>
          <Text style={styles.descText} numberOfLines={3}>{item.description}</Text>
        </View>
      )}
      <View style={[styles.fieldRow, { marginTop: 4 }]}>
        <InfoField label="Due Date" value={formatDateTime(item.due_date || '')} />
        <InfoField label="Created Date" value={formatDateTime(item.created_at || '')} />
      </View>

      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.viewDetailsBtn}
        onPress={() => router.push({ pathname: '/(employee)/job-details', params: { job_id: String(item.id) } })}
        activeOpacity={0.7}
      >
        <Ionicons name="eye-outline" size={14} color={BLUE} />
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
});

export default JobCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e6e7',
    padding: 14,
    marginBottom: 8,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: ICON_BG, justifyContent: 'center', alignItems: 'center',
  },
  cardTopCenter: { flex: 1, marginLeft: 12 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#1B2E6F' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  priorityBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  statusBadge: { backgroundColor: '#E8EBF2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#4B5563' },
  divider: { height: 1, backgroundColor: DIVIDER_COLOR },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sectionIcon: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: ICON_BG, justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#1B2E6F' },
  fieldRow: { flexDirection: 'row', gap: 12 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 10, color: LABEL_COLOR, fontWeight: '500', marginBottom: 2 },
  fieldValue: { fontSize: 12, fontWeight: '600', color: VALUE_COLOR },
  descContainer: { marginBottom: 4 },
  descText: { fontSize: 12, fontWeight: '500', color: VALUE_COLOR, lineHeight: 16 },
  viewDetailsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: 6, backgroundColor: ICON_BG,
  },
  viewDetailsText: { fontSize: 12, fontWeight: '700', color: BLUE },
});
