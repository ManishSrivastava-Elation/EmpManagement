import React, { useEffect, useState, useCallback, useRef } from 'react';
import SearchableSelect from '@/components/common/SearchableSelect';
import { getCustomerOptions } from '@/services/company/job.service';

type Option = {
  label: string;
  value: string | number;
};

type Props = {
  value?: number | null;
  onChange: (value: number | null) => void;
  error?: string;
};

export default function CustomerDropdown({ value, onChange, error }: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCustomers = useCallback(async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await getCustomerOptions(searchQuery);
      if (res.success && res.data) {
        const mapped = res.data.map(c => ({
          label: c.customer_name,
          value: c.id,
        }));
        setOptions(mapped);
      }
    } catch (err) {
      console.warn('Failed to load customer options:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial options
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle search with debouncing
  const handleSearch = useCallback((query: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchCustomers(query);
    }, 500);
  }, [fetchCustomers]);

  return (
    <SearchableSelect
      label="Customer"
      required
      options={options}
      value={value}
      onChange={(val) => onChange(val as number | null)}
      placeholder="Select customer"
      leftIcon="business-outline"
      error={error}
      searchPlaceholder="Search customer by name or phone..."
      loading={loading}
      onSearch={handleSearch}
    />
  );
}
