import React from 'react';
import SearchableSelect from '@/components/common/SearchableSelect';

type Props = {
  value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  onChange: (value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => void;
  error?: string;
};

const PRIORITY_OPTIONS = [
  { label: 'Critical', value: 'URGENT' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

export default function PriorityDropdown({ value, onChange, error }: Props) {
  return (
    <SearchableSelect
      label="Priority"
      required
      options={PRIORITY_OPTIONS}
      value={value}
      onChange={(val) => {
        if (val) {
          onChange(val as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT');
        }
      }}
      placeholder="Select priority"
      leftIcon="flag-outline"
      error={error}
    />
  );
}
