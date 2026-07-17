import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { JobDetail } from '@/services/company/job.service';
import { BLUE, DIVIDER_COLOR, ICON_BG, LABEL_COLOR, PRIORITY, VALUE_COLOR } from './constants';
import { formatDateTime } from '@/utils/timeHelpers';

const InfoField = memo(({ label, value }: { label: string; value?: string | null }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '—'}</Text>
  </View>
));

type Props = { job: JobDetail };

const JobDetailsCard = memo(({ job }: Props) => {
  const priorityConfig = PRIORITY[job.priority] || PRIORITY.MEDIUM;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="briefcase" size={20} color={BLUE} />
        </View>
        <Text style={styles.sectionTitle}>Job Information</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.jobTitle}>{job.job_title}</Text>

      {!!job.description && (
        <Text style={styles.description}>{job.description}</Text>
      )}

      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: priorityConfig.bg }]}>
          <View style={[styles.dot, { backgroundColor: priorityConfig.color }]} />
          <Text style={[styles.badgeText, { color: priorityConfig.color }]}>{priorityConfig.label}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <InfoField label="Due Date" value={formatDateTime(job.due_date)} />
        <InfoField label="Created" value={formatDateTime(job.created_at)} />
      </View>

      {!!job.updated_at && (
        <InfoField label="Last Updated" value={formatDateTime(job.updated_at)} />
      )}
    </View>
  );
});

export default JobDetailsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: ICON_BG, justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1B2E6F' },
  divider: { height: 1, backgroundColor: DIVIDER_COLOR },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  description: { fontSize: 13, color: VALUE_COLOR, lineHeight: 18 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  statusBadge: {
    backgroundColor: '#E8EBF2', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1 },
  label: { fontSize: 10, color: LABEL_COLOR, fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 12, fontWeight: '600', color: VALUE_COLOR },
});
