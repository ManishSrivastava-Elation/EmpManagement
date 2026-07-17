import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { JobDetailEmployee } from '@/services/company/job.service';
import { BLUE, DIVIDER_COLOR, ICON_BG, LABEL_COLOR, VALUE_COLOR } from './constants';

const InfoField = memo(({ label, value }: { label: string; value?: string | null }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '—'}</Text>
  </View>
));

type Props = { employee: JobDetailEmployee };

const EmployeeDetailsCard = memo(({ employee }: Props) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.iconBox}>
        <Ionicons name="person-circle" size={20} color={BLUE} />
      </View>
      <Text style={styles.sectionTitle}>Assigned Employee</Text>
    </View>

    <View style={styles.divider} />

    <InfoField label="Employee Name" value={employee.employee_name} />

    <View style={styles.row}>
      <InfoField label="Phone" value={employee.phone} />
      <InfoField label="Email" value={employee.email} />
    </View>
  </View>
));

export default EmployeeDetailsCard;

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
  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, marginBottom: 2 },
  label: { fontSize: 10, color: LABEL_COLOR, fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 12, fontWeight: '600', color: VALUE_COLOR },
});
