// components/employees/expense/FileUploadSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';

interface FileUploadSectionProps {
  billFile: { uri: string; name: string; type: string } | null;
  onPickCamera: () => void;
  onPickGallery: () => void;
  onPickDocument: () => void;
  onClearFile: () => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  billFile,
  onPickCamera,
  onPickGallery,
  onPickDocument,
  onClearFile,
}) => {
  return (
    <View style={styles.fileUploadSection}>
      <Text style={styles.inputLabel}>Upload Bill File</Text>
      <View style={styles.filePickerRow}>
        <TouchableOpacity onPress={onPickCamera} style={styles.filePickerBtn}>
          <Ionicons name="camera" size={18} color={theme.colors.primary} />
          <Text style={styles.filePickerText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPickGallery} style={styles.filePickerBtn}>
          <Ionicons name="images" size={18} color={theme.colors.primary} />
          <Text style={styles.filePickerText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPickDocument} style={styles.filePickerBtn}>
          <Ionicons name="document-text" size={18} color={theme.colors.primary} />
          <Text style={styles.filePickerText}>Document</Text>
        </TouchableOpacity>
      </View>
      {billFile && (
        <View style={styles.selectedFileContainer}>
          <Text style={styles.selectedFileName} numberOfLines={1}>
            📎 {billFile.name}
          </Text>
          <TouchableOpacity onPress={onClearFile}>
            <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fileUploadSection: {
    marginBottom: 20,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: 8,
    marginLeft: 4,
  },
  filePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  filePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.15)',
  },
  filePickerText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: theme.fontWeight.bold,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedFileName: {
    color: theme.colors.text,
    fontSize: 12,
    flex: 1,
    marginRight: 8,
    fontWeight: '500',
  },
});
