import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LABEL_COLOR, NAVY } from './constants';

interface Props {
  error: string | null;
  hasFilters: boolean;
  onRetry: () => void;
}

const CustomerEmptyState = memo(({ error, hasFilters, onRetry }: Props) => {
  if (error) {
    return (
      <View style={styles.container}>
        <Ionicons name="cloud-offline-outline" size={52} color="#D1D5DB" />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>{error}</Text>
        <TouchableOpacity style={styles.btn} onPress={onRetry}>
          <Text style={styles.btnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="business-outline" size={52} color="#D1D5DB" />
      <Text style={styles.title}>No Customers Found</Text>
      <Text style={styles.subtitle}>
        {hasFilters
          ? 'Try adjusting your search or filters.'
          : 'No customers have been added yet.'}
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onRetry}>
        <Text style={styles.btnText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
});

export default CustomerEmptyState;

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 8 },
  subtitle: { fontSize: 13, color: LABEL_COLOR, textAlign: 'center', paddingHorizontal: 32 },
  btn: {
    marginTop: 8, backgroundColor: NAVY,
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
