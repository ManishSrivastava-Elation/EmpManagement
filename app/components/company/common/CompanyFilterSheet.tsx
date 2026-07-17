import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@/theme';

interface Props {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onReset: () => void;
  onApply: () => void;
  children: React.ReactNode;
  hasActiveFilters?: boolean;
}

export default function CompanyFilterSheet({
  visible,
  title,
  onCancel,
  onReset,
  onApply,
  children,
  hasActiveFilters = false,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {children}
          </ScrollView>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnReset} onPress={onReset}>
              <Text style={styles.btnResetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnApply} onPress={onApply}>
              <Text style={styles.btnApplyText}>Apply{hasActiveFilters ? ' •' : ''}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1B2E6F', marginBottom: 12 },
  body: { paddingBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnCancel: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  btnReset: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnResetText: { fontSize: 14, fontWeight: '600', color: theme.colors.danger },
  btnApply: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#1B2E6F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnApplyText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
