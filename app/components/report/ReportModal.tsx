import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView,
  Platform, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FilterTypeSelector, FilterType } from './FilterTypeSelector';
import { DateRangePicker } from './DateRangePicker';
import { EmployeeSelectorModal, ReportEmployee } from './EmployeeSelectorModal';
import { getEmployees } from '@/services/company/employees/employee.service';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  onShare: (params: { startDate: string; endDate: string; employeeId?: number }) => Promise<void>;
}

export default function ReportModal({ visible, title, onClose, onShare }: Props) {
  const [filterType, setFilterType]           = useState<FilterType>('all');
  const [employees, setEmployees]             = useState<ReportEmployee[]>([]);
  const [empLoading, setEmpLoading]           = useState(false);
  const [selectedEmpId, setSelectedEmpId]     = useState(0);
  const [selectedEmpLabel, setSelectedEmpLabel] = useState('');
  const [showEmpModal, setShowEmpModal]       = useState(false);
  const [fromDate, setFromDate]               = useState('');
  const [toDate, setToDate]                   = useState('');
  const [showPicker, setShowPicker]           = useState(false);
  const [pickerTarget, setPickerTarget]       = useState<'from' | 'to'>('from');
  const [errors, setErrors]                   = useState<Record<string, string>>({});
  const [loading, setLoading]                 = useState(false);

  useEffect(() => {
    if (!visible) return;
    setEmpLoading(true);
    getEmployees({ limit: 200 })
      .then((res) => {
        const list: ReportEmployee[] = (res.data ?? []).map((e: any) => ({
          EmployeeId:   e.EmployeeId ?? e.employee_id,
          FullName:     e.FullName   ?? e.full_name,
          EmployeeCode: e.EmployeeCode ?? e.employee_code,
        }));
        setEmployees(list);
      })
      .catch(() => {})
      .finally(() => setEmpLoading(false));
  }, [visible]);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const openPicker = (target: 'from' | 'to') => { setPickerTarget(target); setShowPicker(true); };

  const onDateChange = (_: any, date?: Date) => {
    setShowPicker(false);
    if (!date) return;
    const formatted = formatDate(date);
    if (pickerTarget === 'from') { setFromDate(formatted); clearError('fromDate'); }
    else                         { setToDate(formatted);   clearError('toDate'); }
  };

  const clearError = (key: string) =>
    setErrors(prev => { const { [key]: _, ...rest } = prev; return rest; });

  const validate = () => {
    const e: Record<string, string> = {};
    if (filterType === 'specific' && !selectedEmpId) e.employeeId = 'Employee is required';
    if (!fromDate.trim()) e.fromDate = 'From date is required';
    if (!toDate.trim())   e.toDate   = 'To date is required';
    if (fromDate && toDate && fromDate > toDate) e.fromDate = '"From" date cannot be after "To" date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleShare = async () => {
    if (!validate()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const params: { startDate: string; endDate: string; employeeId?: number } = {
        startDate: fromDate, endDate: toDate,
      };
      if (filterType === 'specific') params.employeeId = selectedEmpId;
      await onShare(params);
      handleClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to share report');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFilterType('all'); setFromDate(''); setToDate('');
    setSelectedEmpId(0); setSelectedEmpLabel(''); setErrors({});
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <FilterTypeSelector selectedType={filterType} onSelect={setFilterType} />

          {filterType === 'specific' && (
            <View style={styles.group}>
              <Text style={styles.inputLabel}>Employee *</Text>
              <TouchableOpacity
                style={[styles.selector, errors.employeeId && styles.selectorError]}
                onPress={() => setShowEmpModal(true)}
              >
                <Ionicons name="people-outline" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
                <Text style={[styles.selectorText, !selectedEmpLabel && { color: '#9ca3af' }]}>
                  {empLoading ? 'Loading employees...' : selectedEmpLabel || 'Select employee'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9ca3af" />
              </TouchableOpacity>
              {errors.employeeId && <Text style={styles.errorText}>{errors.employeeId}</Text>}
            </View>
          )}

          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            errors={errors}
            onPressFrom={() => openPicker('from')}
            onPressTo={() => openPicker('to')}
          />

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleShare}
            disabled={loading}
            style={styles.shareBtn}
          >
            <LinearGradient
              colors={['#9ca3af', '#4b5563']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Text style={styles.shareBtnText}>Share</Text>
                    <Ionicons name="share-social-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )
              }
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        <EmployeeSelectorModal
          visible={showEmpModal}
          employees={employees}
          loading={empLoading}
          selectedId={selectedEmpId}
          onSelect={(emp) => {
            setSelectedEmpId(emp.EmployeeId);
            setSelectedEmpLabel(`${emp.FullName} (${emp.EmployeeCode})`);
            clearError('employeeId');
          }}
          onClose={() => setShowEmpModal(false)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#fff' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn:       { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  scroll:        { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 24 },
  group:         { marginBottom: 16 },
  inputLabel:    { color: '#6b7280', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  selector:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12 },
  selectorError: { borderColor: '#ef4444' },
  selectorText:  { flex: 1, fontSize: 15, color: '#111827' },
  errorText:     { color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 6 },
  shareBtn:      { borderRadius: 16, overflow: 'hidden', marginTop: 16, shadowColor: '#4b5563', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  gradient:      { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  shareBtnText:  { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
