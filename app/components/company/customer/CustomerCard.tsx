import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CustomerItem } from '@/services/company/customer.service';
import { BLUE, DIVIDER_COLOR, ICON_BG, LABEL_COLOR, NAVY, VALUE_COLOR } from './constants';
import { formatDateTime } from '@/utils/timeHelpers';

// ─── InfoField ────────────────────────────────────────────────────────────────

const InfoField = memo(({ label, value }: { label: string; value: string }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue} numberOfLines={2}>{value || '—'}</Text>
  </View>
));

// ─── SectionHeading ───────────────────────────────────────────────────────────

const SectionHeading = memo(({ icon, title }: { icon: string; title: string }) => (
  <View style={styles.sectionHead}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon as any} size={14} color={BLUE} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
));

// ─── CustomerCard ─────────────────────────────────────────────────────────────

const CustomerCard = memo(({ item }: { item: CustomerItem }) => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <View style={styles.avatarBox}>
        <Ionicons name="business" size={24} color={BLUE} />
      </View>
      <View style={styles.cardTopCenter}>
        <Text style={styles.custName} numberOfLines={1}>{item.customer_name}</Text>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>ID: {item.id}</Text>
        </View>
      </View>
    </View>

    <View style={styles.divider} />

    <SectionHeading icon="call" title="Contact Details" />
    <View style={styles.fieldRow}>
      <InfoField label="Phone" value={item.phone} />
      <InfoField label="Alternate Phone" value={item.alternate_phone} />
    </View>
    <View style={[styles.fieldRow, { marginTop: 8 }]}>
      <InfoField label="Email" value={item.email} />
      <InfoField label="GSTIN" value={item.gstin_number} />
    </View>

    <View style={styles.divider} />

    <SectionHeading icon="location" title="Address Details" />
    <View style={styles.fieldRow}>
      <InfoField label="Address Line 1" value={item.address_line1} />
      <InfoField label="Address Line 2" value={item.address_line2} />
    </View>
    <View style={[styles.fieldRow, { marginTop: 8 }]}>
      <InfoField label="City" value={item.city} />
      <InfoField label="State" value={item.state} />
    </View>
    <View style={[styles.fieldRow, { marginTop: 8 }]}>
      <InfoField label="Pincode" value={item.pincode} />
    </View>

    <View style={styles.divider} />

    <View style={styles.fieldRow}>
      <InfoField label="Created At" value={formatDateTime(item.created_at || '')} />
      <InfoField label="Updated At" value={formatDateTime(item.updated_at || '')} />
    </View>
  </View>
));

export default CustomerCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1,
    borderColor: '#e5e6e7', padding: 14, marginBottom: 8, gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: ICON_BG, justifyContent: 'center', alignItems: 'center',
  },
  cardTopCenter: { flex: 1, marginLeft: 12 },
  custName: { fontSize: 15, fontWeight: '700', color: NAVY },
  idBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: ICON_BG, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6,
  },
  idText: { fontSize: 11, fontWeight: '600', color: BLUE },
  divider: { height: 1, backgroundColor: DIVIDER_COLOR },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sectionIcon: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: ICON_BG, justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: NAVY },
  fieldRow: { flexDirection: 'row', gap: 12 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 10, color: LABEL_COLOR, fontWeight: '500', marginBottom: 2 },
  fieldValue: { fontSize: 12, fontWeight: '600', color: VALUE_COLOR },
});
