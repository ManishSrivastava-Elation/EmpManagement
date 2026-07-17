// components/employees/expense/AddExpenseModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as yup from 'yup';
import { theme } from '../../../theme';
import FormInput from '../../common/FormInput';
import { OptionInput } from './OptionInput';
import { FileUploadSection } from './FileUploadSection';
import { getExpenseTypes } from '../../../services/employees/expense.service';

const validationSchema = yup.object().shape({
  type: yup.string().required('Expense type is required'),
  description: yup.string().trim().min(3, 'Description must be at least 3 characters').required('Description is required'),
  amount: yup.number().typeError('Amount must be a number').positive('Amount must be greater than 0').required('Amount is required'),
});

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExpense: (data: {
    type: string;
    description: string;
    amount: number;
    hasBill: boolean;
    billFile: { uri: string; name: string; type: string } | null;
  }) => void;
}

export default function AddExpenseModal({ visible, onClose, onAddExpense }: AddExpenseModalProps) {
  const [newExpense, setNewExpense] = useState({ type: '', description: '', amount: '' });
  const [hasBill, setHasBill] = useState(false);
  const [billFile, setBillFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ type?: string; description?: string; amount?: string }>({});
  const [expenseTypeOptions, setExpenseTypeOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (visible) {
      (async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
          Alert.alert('Permission required', 'Camera and gallery access are recommended for bill uploads.');
        }
        try {
          const res = await getExpenseTypes();
          const options = (res.data ?? []).map((t) => ({ label: t.name, value: t.name }));
          setExpenseTypeOptions(options);
        } catch {
          // fallback: options stay empty
        }
      })();
    }
  }, [visible]);

  const resetForm = () => {
    setNewExpense({ type: '', description: '', amount: '' });
    setHasBill(false);
    setBillFile(null);
    setFieldErrors({});
  };

  const pickFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setBillFile({
          uri: asset.uri,
          name: asset.fileName || `camera_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setBillFile({
          uri: asset.uri,
          name: asset.fileName || `gallery_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const pickDocument = async () => {
    try {
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.assets && result.assets[0]) {
        const doc = result.assets[0];
        setBillFile({ uri: doc.uri, name: doc.name, type: doc.mimeType || 'application/octet-stream' });
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    try {
      const validatedData = await validationSchema.validate({
        type: newExpense.type,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
      }, { abortEarly: false });

      onAddExpense({
        type: validatedData.type,
        description: validatedData.description,
        amount: validatedData.amount,
        hasBill,
        billFile,
      });
      resetForm();
      onClose();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: { type?: string; description?: string; amount?: string } = {};
        error.inner.forEach(err => {
          if (err.path === 'type') errors.type = err.message;
          if (err.path === 'description') errors.description = err.message;
          if (err.path === 'amount') errors.amount = err.message;
        });
        setFieldErrors(errors);
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.modalBox}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <OptionInput
              label="Type of Expense"
              options={expenseTypeOptions}
              selectedValue={newExpense.type}
              onSelect={(value) => {
                setNewExpense(prev => ({ ...prev, type: value }));
                if (fieldErrors.type) setFieldErrors(prev => ({ ...prev, type: undefined }));
              }}
              error={fieldErrors.type}
            />

            <FormInput
              label="Description"
              required
              value={newExpense.description}
              onChangeText={(text) => {
                setNewExpense(prev => ({ ...prev, description: text }));
                if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: undefined }));
              }}
              error={fieldErrors.description}
              placeholder="Add details (e.g., client meeting, site travel)"
              multiline
              numberOfLines={3}
            />

            <FormInput
              label="Amount / Cost (₹)"
              required
              type="number"
              value={newExpense.amount}
              onChangeText={(text) => {
                setNewExpense(prev => ({ ...prev, amount: text }));
                if (fieldErrors.amount) setFieldErrors(prev => ({ ...prev, amount: undefined }));
              }}
              error={fieldErrors.amount}
              placeholder="e.g., 249.99"
            />

            <View style={styles.checkboxContainer}>
              <TouchableOpacity onPress={() => setHasBill(!hasBill)} style={styles.checkbox}>
                {hasBill ? (
                  <Ionicons name="checkbox" size={24} color={theme.colors.primary} />
                ) : (
                  <Ionicons name="square-outline" size={24} color={theme.colors.textSecondary} />
                )}
                <Text style={styles.checkboxLabel}>Has receipt/bill bill copy?</Text>
              </TouchableOpacity>
            </View>

            {hasBill && (
              <FileUploadSection
                billFile={billFile}
                onPickCamera={pickFromCamera}
                onPickGallery={pickFromGallery}
                onPickDocument={pickDocument}
                onClearFile={() => setBillFile(null)}
              />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    width: '100%',
    maxHeight: '90%',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: theme.radius.sm,
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.fontWeight.medium,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCancelText: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  modalAddBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  modalAddText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
