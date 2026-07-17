import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import * as yup from 'yup';
import { getExpenseTypes } from '@/services/company/expense.service';
import { theme } from '@/theme';

const validationSchema = yup.object().shape({
  title: yup.string().trim().min(2, 'Title must be at least 2 characters').required('Title is required'),
  description: yup.string().trim().min(3, 'Description must be at least 3 characters').required('Description is required'),
  amount: yup.number().typeError('Amount must be a number').positive('Amount must be greater than 0').required('Amount is required'),
});

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExpense: (data: {
    title: string;
    description: string;
    amount: number;
    expenseDate: string;
    receiptFile: { uri: string; name: string; type: string } | null;
  }) => void;
}

export default function AddExpenseModal({ visible, onClose, onAddExpense }: AddExpenseModalProps) {
  const [form, setForm] = useState({ title: '', description: '', amount: '' });
  const [hasBill, setHasBill] = useState(false);
  const [billFile, setBillFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; description?: string; amount?: string }>({});
  const [expenseTypeOptions, setExpenseTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [typeDropOpen, setTypeDropOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      try {
        const res = await getExpenseTypes();
        setExpenseTypeOptions((res.data ?? []).map(t => ({ label: t.name, value: t.name })));
      } catch { /* fallback to empty */ }
    })();
  }, [visible]);

  const resetForm = () => {
    setForm({ title: '', description: '', amount: '' });
    setHasBill(false);
    setBillFile(null);
    setFieldErrors({});
    setTypeDropOpen(false);
  };

  const pickFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setBillFile({ uri: asset.uri, name: asset.fileName || 'camera_photo.jpg', type: asset.mimeType || 'image/jpeg' });
      }
    } catch { Alert.alert('Error', 'Failed to open camera'); }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setBillFile({ uri: asset.uri, name: asset.fileName || 'gallery_image.jpg', type: asset.mimeType || 'image/jpeg' });
      }
    } catch { Alert.alert('Error', 'Failed to open gallery'); }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.assets && result.assets[0]) {
        const doc = result.assets[0];
        setBillFile({ uri: doc.uri, name: doc.name, type: doc.mimeType || 'application/octet-stream' });
      }
    } catch { Alert.alert('Error', 'Failed to pick document'); }
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    try {
      const validated = await validationSchema.validate(
        { title: form.title, description: form.description, amount: parseFloat(form.amount) },
        { abortEarly: false }
      );
      const today = new Date();
      const expenseDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      onAddExpense({ title: validated.title, description: validated.description, amount: validated.amount, expenseDate, receiptFile: billFile });
      resetForm();
      onClose();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: typeof fieldErrors = {};
        error.inner.forEach(err => {
          if (err.path === 'title') errors.title = err.message;
          if (err.path === 'description') errors.description = err.message;
          if (err.path === 'amount') errors.amount = err.message;
        });
        setFieldErrors(errors);
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  };

  const handleClose = () => { resetForm(); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.modalBox}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Add Expense</Text>

            {/* Title / Type */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Type of Expense</Text>
              <TouchableOpacity style={styles.selectBox} onPress={() => setTypeDropOpen(o => !o)}>
                <Text style={[styles.selectText, !form.title && { color: '#9ca3af' }]}>
                  {form.title || 'Select expense type'}
                </Text>
                <Ionicons name={typeDropOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#6b7280" />
              </TouchableOpacity>
              {fieldErrors.title && <Text style={styles.errorText}>{fieldErrors.title}</Text>}
              {typeDropOpen && (
                <View style={styles.dropList}>
                  {expenseTypeOptions.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.dropListItem, form.title === opt.value && styles.dropListItemActive]}
                      onPress={() => { setForm(p => ({ ...p, title: opt.value })); setTypeDropOpen(false); if (fieldErrors.title) setFieldErrors(p => ({ ...p, title: undefined })); }}
                    >
                      <Text style={[styles.dropListText, form.title === opt.value && { color: theme.colors.primary, fontWeight: '700' }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {expenseTypeOptions.length === 0 && (
                    <Text style={styles.dropListEmpty}>No types available</Text>
                  )}
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, fieldErrors.description && styles.inputError]}
                value={form.description}
                onChangeText={t => { setForm(p => ({ ...p, description: t })); if (fieldErrors.description) setFieldErrors(p => ({ ...p, description: undefined })); }}
                placeholder="Add details (e.g., client meeting, project name)"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
              {fieldErrors.description && <Text style={styles.errorText}>{fieldErrors.description}</Text>}
            </View>

            {/* Amount */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Amount / Cost (₹)</Text>
              <TextInput
                style={[styles.textInput, fieldErrors.amount && styles.inputError]}
                value={form.amount}
                onChangeText={t => { setForm(p => ({ ...p, amount: t })); if (fieldErrors.amount) setFieldErrors(p => ({ ...p, amount: undefined })); }}
                placeholder="e.g., 249.99"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
              {fieldErrors.amount && <Text style={styles.errorText}>{fieldErrors.amount}</Text>}
            </View>

            {/* Has Bill Checkbox */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity onPress={() => setHasBill(v => !v)} style={styles.checkbox}>
                <Ionicons name={hasBill ? 'checkbox-outline' : 'square-outline'} size={24} color={hasBill ? theme.colors.primary : '#9ca3af'} />
                <Text style={styles.checkboxLabel}>Has Bill?</Text>
              </TouchableOpacity>
            </View>

            {/* File Upload */}
            {hasBill && (
              <View style={styles.fileSection}>
                <Text style={styles.fieldLabel}>Upload Bill File</Text>
                <View style={styles.filePickerRow}>
                  <TouchableOpacity onPress={pickFromCamera} style={styles.filePickerBtn}>
                    <Ionicons name="camera" size={18} color="#4b5563" />
                    <Text style={styles.filePickerText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={pickFromGallery} style={styles.filePickerBtn}>
                    <Ionicons name="images" size={18} color="#4b5563" />
                    <Text style={styles.filePickerText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={pickDocument} style={styles.filePickerBtn}>
                    <Ionicons name="document-text" size={18} color="#4b5563" />
                    <Text style={styles.filePickerText}>Document</Text>
                  </TouchableOpacity>
                </View>
                {billFile && (
                  <View style={styles.selectedFile}>
                    <Text style={styles.selectedFileName} numberOfLines={1}>📎 {billFile.name}</Text>
                    <TouchableOpacity onPress={() => setBillFile(null)}>
                      <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={handleClose} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={styles.modalAddBtn}>
                <Text style={styles.modalAddText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: width * 0.9, maxHeight: '85%', borderRadius: 28, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginLeft: 2 },
  textInput: {
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827',
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  inputError: { borderColor: theme.colors.danger },
  errorText: { fontSize: 11, color: theme.colors.danger, marginTop: 4, marginLeft: 2 },
  selectBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  selectText: { fontSize: 14, color: '#111827', flex: 1 },
  dropList: {
    backgroundColor: theme.colors.white, borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, marginTop: 4, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 8,
  },
  dropListItem: { paddingHorizontal: 14, paddingVertical: 11 },
  dropListItemActive: { backgroundColor: '#eff6ff' },
  dropListText: { fontSize: 14, color: '#374151' },
  dropListEmpty: { paddingHorizontal: 14, paddingVertical: 11, color: '#9ca3af', fontSize: 13 },
  checkboxContainer: { marginBottom: 16 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkboxLabel: { color: '#374151', fontSize: 15, fontWeight: '500' },
  fileSection: { marginBottom: 16 },
  filePickerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 6 },
  filePickerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, backgroundColor: '#f3f4f6', paddingVertical: 9,
    borderRadius: 30, borderWidth: 1, borderColor: '#e5e7eb',
  },
  filePickerText: { color: '#4b5563', fontSize: 12, fontWeight: '600' },
  selectedFile: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10,
  },
  selectedFileName: { color: '#374151', fontSize: 12, flex: 1, marginRight: 8 },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 30, alignItems: 'center',
    backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb',
  },
  modalCancelText: { color: '#6b7280', fontWeight: '700', fontSize: 14 },
  modalAddBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 30, alignItems: 'center',
    backgroundColor: theme.colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  modalAddText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
