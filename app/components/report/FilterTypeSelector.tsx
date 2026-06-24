import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type FilterType = 'all' | 'specific';

const OPTIONS: { type: FilterType; label: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'all',      label: 'All Employees',    subtitle: 'Export full data for date range', icon: 'people-outline' },
  { type: 'specific', label: 'Specific Employee', subtitle: 'Export single employee data',    icon: 'person-outline' },
];

interface Props {
  selectedType: FilterType;
  onSelect: (type: FilterType) => void;
}

export const FilterTypeSelector = ({ selectedType, onSelect }: Props) => (
  <View>
    <Text style={styles.label}>Select filter type</Text>
    <View style={styles.grid}>
      {OPTIONS.map((opt) => {
        const active = selectedType === opt.type;
        return (
          <TouchableOpacity
            key={opt.type}
            activeOpacity={0.8}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => onSelect(opt.type)}
          >
            <Ionicons name={opt.icon} size={22} color={active ? '#4b5563' : '#9ca3af'} />
            <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>{opt.label}</Text>
            <Text style={styles.cardSub}>{opt.subtitle}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  label:           { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 12 },
  grid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  card:            { width: '47.5%', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', padding: 14, gap: 4 },
  cardActive:      { borderColor: '#9ca3af', backgroundColor: '#f9fafb' },
  cardLabel:       { fontSize: 13, fontWeight: '700', color: '#9ca3af', marginTop: 6 },
  cardLabelActive: { color: '#374151' },
  cardSub:         { fontSize: 11, color: '#9ca3af' },
});
