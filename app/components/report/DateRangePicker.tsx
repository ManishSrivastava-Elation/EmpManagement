import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  fromDate: string;
  toDate: string;
  errors: { fromDate?: string; toDate?: string };
  onPressFrom: () => void;
  onPressTo: () => void;
}

export const DateRangePicker = ({ fromDate, toDate, errors, onPressFrom, onPressTo }: Props) => (
  <View>
    <View style={styles.group}>
      <Text style={styles.label}>From Date *</Text>
      <TouchableOpacity style={[styles.selector, errors.fromDate && styles.selectorError]} onPress={onPressFrom}>
        <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.icon} />
        <Text style={[styles.text, !fromDate && styles.placeholder]}>{fromDate || 'Select from date'}</Text>
        <Ionicons name="chevron-down-outline" size={18} color="#9ca3af" />
      </TouchableOpacity>
      {errors.fromDate && <Text style={styles.error}>{errors.fromDate}</Text>}
    </View>

    <View style={styles.group}>
      <Text style={styles.label}>To Date *</Text>
      <TouchableOpacity style={[styles.selector, errors.toDate && styles.selectorError]} onPress={onPressTo}>
        <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.icon} />
        <Text style={[styles.text, !toDate && styles.placeholder]}>{toDate || 'Select to date'}</Text>
        <Ionicons name="chevron-down-outline" size={18} color="#9ca3af" />
      </TouchableOpacity>
      {errors.toDate && <Text style={styles.error}>{errors.toDate}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  group:         { marginBottom: 16 },
  label:         { color: '#6b7280', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  selector:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12 },
  selectorError: { borderColor: '#ef4444' },
  icon:          { marginRight: 8 },
  text:          { flex: 1, fontSize: 15, color: '#111827' },
  placeholder:   { color: '#9ca3af' },
  error:         { color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 6 },
});
