// components/common/MonthNavigator.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface MonthNavigatorProps {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  disableNext?: boolean;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  month,
  year,
  onPrev,
  onNext,
  disableNext
}) => {
  return (
    <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.monthNav}>
      <TouchableOpacity onPress={onPrev} style={styles.navBtn}>
        <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
      <View style={styles.monthCenter}>
        <Text style={styles.monthName}>{MONTH_NAMES[month]}</Text>
        <Text style={styles.yearLabel}>{year}</Text>
      </View>
      <TouchableOpacity
        onPress={onNext}
        style={[styles.navBtn, disableNext && { opacity: 0.3 }]}
        disabled={disableNext}
      >
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default MonthNavigator;

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  navBtn: {
    padding: 8,
    borderRadius: theme.radius.full,
    backgroundColor: '#eff6ff', // light primary shade
  },
  monthCenter: {
    alignItems: 'center',
  },
  monthName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  yearLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: theme.fontWeight.medium,
  },
});
