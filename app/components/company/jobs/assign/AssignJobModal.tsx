import React from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, StyleSheet,
  Text, TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AssignJobForm from './AssignJobForm';
import { theme } from '@/theme';

const { colors } = theme;

type Props = {
  visible: boolean;
  jobId: number;
  isReassign: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AssignJobModal({ visible, jobId, isReassign, onClose, onSuccess }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheet}
            >
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>{isReassign ? 'Reassign Job' : 'Assign Job'}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <AssignJobForm jobId={jobId} isReassign={isReassign} onSuccess={onSuccess} />
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  body: { padding: 20 },
});
