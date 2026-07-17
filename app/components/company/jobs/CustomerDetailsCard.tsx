import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { JobDetailCustomer } from '@/services/company/job.service';
import { BLUE, DIVIDER_COLOR, ICON_BG, LABEL_COLOR, VALUE_COLOR } from './constants';

const InfoField = memo(({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
});

type Props = { customer: JobDetailCustomer };

const CustomerDetailsCard = memo(({ customer }: Props) => {
  const addressLine = [customer.address_line1, customer.address_line2].filter(Boolean).join(', ');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="person" size={20} color={BLUE} />
        </View>
        <Text style={styles.sectionTitle}>Customer Information</Text>
      </View>

      <View style={styles.divider} />

      <InfoField label="Customer Name" value={customer.customer_name} />

      <View style={styles.row}>
        <InfoField label="Phone" value={customer.phone} />
        {!!customer.alternate_phone && (
          <InfoField label="Alternate Phone" value={customer.alternate_phone} />
        )}
      </View>

      {!!customer.email && <InfoField label="Email" value={customer.email} />}

      <View style={styles.divider} />

      {!!addressLine && <InfoField label="Address" value={addressLine} />}

      <View style={styles.row}>
        {!!customer.city && <InfoField label="City" value={customer.city} />}
        {!!customer.state && <InfoField label="State" value={customer.state} />}
        {!!customer.pincode && <InfoField label="Pincode" value={customer.pincode} />}
      </View>

      {!!customer.gstin_number && (
        <InfoField label="GST Number" value={customer.gstin_number} />
      )}
    </View>
  );
});

export default CustomerDetailsCard;

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
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  field: { flex: 1, minWidth: 100, marginBottom: 2 },
  label: { fontSize: 10, color: LABEL_COLOR, fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 12, fontWeight: '600', color: VALUE_COLOR },
});
