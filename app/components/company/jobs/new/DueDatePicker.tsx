import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { theme } from '@/theme';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

type Props = {
  value: string; // ISO String format
  onChange: (value: string) => void;
  error?: string;
};

export default function DueDatePicker({ value, onChange, error }: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Parse current value or default to now
  const currentDate = value ? new Date(value) : new Date();

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;

    // Merge selected date with current time
    const merged = new Date(currentDate);
    merged.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    // Now trigger time picker
    setTimeout(() => {
      setShowTimePicker(true);
    }, 150);
    
    // Temporarily update with new date
    onChange(toLocalISOString(merged));
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'dismissed' || !selectedTime) return;

    // Merge selected time with current date
    const merged = new Date(currentDate);
    merged.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

    onChange(toLocalISOString(merged));
  };

  const toLocalISOString = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const formatDisplay = (val: string) => {
    if (!val) return 'Select date and time';
    const date = new Date(val);
    if (isNaN(date.getTime())) return 'Select date and time';
    
    // Format: "05 Jul 2026, 10:00 AM"
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        Due Date & Time
        <Text style={styles.required}> *</Text>
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowDatePicker(true)}
        style={[styles.selector, !!error && styles.selectorError]}
      >
        <Ionicons name="calendar-outline" size={18} color={value ? colors.primary : colors.textSecondary} style={styles.icon} />
        <Text style={[styles.selectorText, !value && styles.placeholderText]}>
          {formatDisplay(value)}
        </Text>
        <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {!!error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={currentDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  selectorError: {
    borderColor: colors.danger,
  },
  icon: {
    marginRight: spacing.sm,
  },
  selectorText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.xs,
  },
});
