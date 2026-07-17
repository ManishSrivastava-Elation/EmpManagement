// components/common/LoadingOverlay.tsx
import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message = 'Loading...' }: LoadingOverlayProps) {
  const { colors } = theme;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.white }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
});