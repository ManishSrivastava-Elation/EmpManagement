import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ReportEmployee {
  EmployeeId: number;
  FullName: string;
  EmployeeCode: string;
}

interface Props {
  visible: boolean;
  employees: ReportEmployee[];
  loading: boolean;
  selectedId: number;
  onSelect: (emp: ReportEmployee) => void;
  onClose: () => void;
}

export const EmployeeSelectorModal = ({ visible, employees, loading, selectedId, onSelect, onClose }: Props) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Employee</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 360 }}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            employees.map((emp) => {
              const active = selectedId === emp.EmployeeId;
              return (
                <TouchableOpacity
                  key={emp.EmployeeId}
                  style={[styles.item, active && styles.itemActive]}
                  onPress={() => { onSelect(emp); onClose(); }}
                >
                  <Text style={[styles.itemName, active && styles.itemTextActive]}>{emp.FullName}</Text>
                  <Text style={[styles.itemCode, active && styles.itemCodeActive]}>{emp.EmployeeCode}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 28 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginBottom: 12 },
  title:         { fontSize: 16, fontWeight: '700', color: '#111827' },
  closeBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  loadingText:   { padding: 16, textAlign: 'center', color: '#6b7280' },
  item:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 6, backgroundColor: '#f9fafb' },
  itemActive:    { backgroundColor: '#4b5563' },
  itemName:      { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemCode:      { fontSize: 12, color: '#6b7280' },
  itemTextActive:{ color: '#fff' },
  itemCodeActive:{ color: 'rgba(255,255,255,0.7)' },
});
