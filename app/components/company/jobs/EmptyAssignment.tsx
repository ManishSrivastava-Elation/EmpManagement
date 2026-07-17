import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BLUE, DIVIDER_COLOR, ICON_BG, LABEL_COLOR } from './constants';

const EmptyAssignment = memo(() => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.iconBox}>
        <Ionicons name="person-circle" size={20} color={BLUE} />
      </View>
      <Text style={styles.sectionTitle}>Assigned Employee</Text>
    </View>

    <View style={styles.divider} />

    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="person-outline" size={32} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Employee Assigned</Text>
      <Text style={styles.emptySubtitle}>Use the button below to assign an employee.</Text>
    </View>
  </View>
));

export default EmptyAssignment;

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
  emptyContainer: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptyIconBox: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 12, color: LABEL_COLOR, textAlign: 'center' },
});
