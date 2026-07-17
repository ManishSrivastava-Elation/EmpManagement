// components/employees/expense/OptionInput.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

const { width } = Dimensions.get('window');

interface OptionInputProps {
  label: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string;
}

export const OptionInput: React.FC<OptionInputProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options.find(opt => opt.value === selectedValue);

  const handleSelect = (value: string) => {
    onSelect(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label} *</Text>
      <TouchableOpacity
        style={[styles.optionSelector, error && styles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.optionSelectorText, !selectedOption && { color: theme.colors.textSecondary }]}>
          {selectedOption ? selectedOption.label : 'Select an option'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.optionsModalOverlay}>
          <View style={styles.optionsModalContainer}>
            <Text style={styles.optionsModalTitle}>Select {label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionItemText}>{item.label}</Text>
                  {selectedValue === item.value && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.optionsModalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.optionsModalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: 6,
    marginLeft: 4,
  },
  optionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionSelectorText: {
    color: theme.colors.text,
    fontSize: 15,
  },
  inputError: {
    borderColor: theme.colors.danger,
    borderWidth: 1,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 6,
    fontWeight: theme.fontWeight.medium,
  },
  optionsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModalContainer: {
    width: width * 0.85,
    maxHeight: '60%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: 20,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  optionsModalTitle: {
    fontSize: 17,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionItemText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  optionsModalCloseBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: theme.radius.full,
  },
  optionsModalCloseText: {
    fontSize: 15,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
});
