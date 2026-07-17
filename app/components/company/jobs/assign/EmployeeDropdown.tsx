import React, { useCallback, useEffect, useRef, useState } from 'react';
import SearchableSelect from '@/components/common/SearchableSelect';
import { getEmployeeOptions, type EmployeeOption } from '@/services/company/job.service';

type Props = {
  value: number | null;
  onChange: (id: number | null) => void;
  error?: string;
};

export default function EmployeeDropdown({ value, onChange, error }: Props) {
  const [options, setOptions] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOptions = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const res = await getEmployeeOptions(search);
      setOptions(res.data ?? []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  const handleSearch = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchOptions(query), 400);
  }, [fetchOptions]);

  const selectOptions = options.map(e => ({ label: e.employee_name, value: e.id }));

  return (
    <SearchableSelect
      label="Employee"
      required
      error={error}
      options={selectOptions}
      value={value}
      onChange={(v) => onChange(v !== null ? Number(v) : null)}
      placeholder="Select an employee"
      leftIcon="person"
      searchPlaceholder="Search by name..."
      emptyStateText="No employees found"
      loading={loading}
      onSearch={handleSearch}
    />
  );
}
