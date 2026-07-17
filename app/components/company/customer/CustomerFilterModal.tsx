import React, { memo } from 'react';
import {
  Modal, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { LABEL_COLOR, NAVY, SORT_OPTIONS, VALUE_COLOR, type ActiveFilters } from './constants';
import { theme } from '@/theme';

interface Props {
  visible: boolean;
  draft: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onCancel: () => void;
}

const CustomerFilterModal = memo(({ visible, draft, onChange, onApply, onReset, onCancel }: Props) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Filters</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={draft.city}
            onChangeText={v => onChange({ ...draft, city: v })}
            placeholder="e.g. Indore"
            placeholderTextColor={LABEL_COLOR}
          />

          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            value={draft.state}
            onChangeText={v => onChange({ ...draft, state: v })}
            placeholder="e.g. Madhya Pradesh"
            placeholderTextColor={LABEL_COLOR}
          />

          <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={draft.startDate}
            onChangeText={v => onChange({ ...draft, startDate: v })}
            placeholder="2025-01-01"
            placeholderTextColor={LABEL_COLOR}
            keyboardType="numeric"
          />

          <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={draft.endDate}
            onChangeText={v => onChange({ ...draft, endDate: v })}
            placeholder="2025-12-31"
            placeholderTextColor={LABEL_COLOR}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Sort By</Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, draft.sortBy === opt.value && styles.chipActive]}
                onPress={() => onChange({ ...draft, sortBy: opt.value })}
              >
                <Text style={[styles.chipText, draft.sortBy === opt.value && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Order</Text>
          <View style={styles.chipRow}>
            {(['ASC', 'DESC'] as const).map(o => (
              <TouchableOpacity
                key={o}
                style={[styles.chip, draft.order === o && styles.chipActive]}
                onPress={() => onChange({ ...draft, order: o })}
              >
                <Text style={[styles.chipText, draft.order === o && styles.chipTextActive]}>
                  {o === 'ASC' ? 'Ascending' : 'Descending'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
            <Text style={styles.btnCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnReset} onPress={onReset}>
            <Text style={styles.btnResetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnApply} onPress={onApply}>
            <Text style={styles.btnApplyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
));

export default CustomerFilterModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: NAVY, marginBottom: 16 },
  body: { paddingBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: LABEL_COLOR, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 14, height: 46, fontSize: 14, color: VALUE_COLOR,
    backgroundColor: '#FAFAFA',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  chipActive: { backgroundColor: NAVY, borderColor: NAVY },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnCancel: {
    flex: 1, height: 46, borderRadius: 10, borderWidth: 1,
    borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
  },
  btnCancelText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  btnReset: {
    flex: 1, height: 46, borderRadius: 10, borderWidth: 1,
    borderColor: theme.colors.danger, alignItems: 'center', justifyContent: 'center',
  },
  btnResetText: { fontSize: 14, fontWeight: '600', color: theme.colors.danger },
  btnApply: {
    flex: 1, height: 46, borderRadius: 10,
    backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center',
  },
  btnApplyText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
