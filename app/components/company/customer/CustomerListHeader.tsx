import React, { memo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, LABEL_COLOR, NAVY, VALUE_COLOR } from './constants';
import { theme } from '@/theme';

interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onClearSearch: () => void;
  activeFilterCount: number;
  totalCustomers: number;
  onOpenFilter: () => void;
}

const CustomerListHeader = memo(({
  searchQuery, onSearchChange, onClearSearch,
  activeFilterCount, totalCustomers, onOpenFilter,
}: Props) => (
  <View style={styles.container}>
    <View style={styles.searchRow}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={LABEL_COLOR} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, phone, email, city..."
          placeholderTextColor={LABEL_COLOR}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClearSearch} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={LABEL_COLOR} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
        onPress={onOpenFilter}
      >
        <Ionicons
          name="options-outline"
          size={20}
          color={activeFilterCount > 0 ? theme.colors.white : NAVY}
        />
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
    <Text style={styles.recordsLabel}>{totalCustomers} Customers</Text>
  </View>
));

export default CustomerListHeader;

const styles = StyleSheet.create({
  container: { paddingTop: 12, marginBottom: 4, backgroundColor: BG },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, fontSize: 14, color: VALUE_COLOR, padding: 0 },
  filterBtn: {
    width: 46, height: 46, borderRadius: 8,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterBtnActive: { backgroundColor: NAVY, borderColor: NAVY },
  badge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: theme.colors.danger,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  recordsLabel: {
    fontSize: 12, fontWeight: '700', color: LABEL_COLOR,
    letterSpacing: 0.3, marginBottom: 8,
  },
});
