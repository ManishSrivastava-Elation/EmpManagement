import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import {
  JobList,
  JobFilterSheet,
  JobSearchBar,
  EmptyState,
  BG,
  LABEL_COLOR,
  DEFAULT_FILTERS,
  type ActiveFilters,
} from '@/components/employees/job';
import {
  getEmployeeJobs,
  type JobItem,
  type JobMeta,
} from '@/services/employees/job.service';
import type { JobFilters } from '@/services/company/job.service';
import { theme } from '@/theme';
import { JobListSkeleton } from '@/components/employee/skeleton';

const LIMIT = 10;
const EMPTY_META: JobMeta = {
  page: 1, limit: LIMIT, total: 0, totalPages: 0,
  hasNextPage: false, hasPrevPage: false,
};

export default function EmployeeJobScreen() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [meta, setMeta] = useState<JobMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (activeFilters.priority) n++;
    if (activeFilters.startDate) n++;
    if (activeFilters.endDate) n++;
    if (activeFilters.sortBy !== 'created_at' || activeFilters.order !== 'DESC') n++;
    return n;
  }, [activeFilters]);

  const buildFilters = useCallback((page: number): JobFilters => {
    const f: JobFilters = { page, limit: LIMIT };
    if (debouncedSearch.trim()) f.search = debouncedSearch.trim();
    if (activeFilters.priority) f.priority = activeFilters.priority;
    if (activeFilters.startDate) f.startDate = activeFilters.startDate;
    if (activeFilters.endDate) f.endDate = activeFilters.endDate;
    if (activeFilters.sortBy) f.sortBy = activeFilters.sortBy;
    if (activeFilters.order) f.order = activeFilters.order;
    return f;
  }, [debouncedSearch, activeFilters]);

  const load = useCallback(async (page: number, append = false) => {
    if (page === 1) append ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const res = await getEmployeeJobs(buildFilters(page));
      setJobs(prev =>
        append && page > 1 ? [...prev, ...(res.data ?? [])] : (res.data ?? [])
      );
      setMeta(res.meta ?? EMPTY_META);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [buildFilters]);

  useEffect(() => { load(1, false); }, [debouncedSearch, activeFilters]);
  useFocusEffect(useCallback(() => { load(1, false); }, [debouncedSearch, activeFilters]));

  const onRefresh = useCallback(() => load(1, false), [load]);
  const onEndReached = useCallback(() => {
    if (!loadingMore && !loading && meta.hasNextPage) load(meta.page + 1, true);
  }, [loadingMore, loading, meta, load]);

  const openFilter = useCallback(() => { setDraftFilters(activeFilters); setFilterVisible(true); }, [activeFilters]);
  const applyFilter = useCallback(() => { setActiveFilters(draftFilters); setFilterVisible(false); }, [draftFilters]);
  const resetFilter = useCallback(() => { setDraftFilters(DEFAULT_FILTERS); setActiveFilters(DEFAULT_FILTERS); setFilterVisible(false); }, []);

  const ListHeader = useMemo(() => (
    <JobSearchBar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onClearSearch={() => setSearchQuery('')}
      activeFilterCount={activeFilterCount}
      totalJobs={meta.total}
      onOpenFilter={openFilter}
    />
  ), [searchQuery, activeFilterCount, meta.total, openFilter]);

  const ListEmpty = useMemo(() => (
    loading ? null : (
      <EmptyState
        error={error}
        hasFilters={!!(debouncedSearch || activeFilterCount > 0)}
        onRetry={() => load(1, false)}
      />
    )
  ), [loading, error, debouncedSearch, activeFilterCount, load]);

  const ListFooter = useMemo(() => (
    loadingMore ? (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    ) : !meta.hasNextPage && jobs.length > 0 ? (
      <View style={styles.footer}>
        <Text style={styles.footerText}>No more jobs</Text>
      </View>
    ) : null
  ), [loadingMore, meta.hasNextPage, jobs.length]);

  if (loading && !refreshing) return <JobListSkeleton />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <JobList
        data={jobs}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
      />

      <JobFilterSheet
        visible={filterVisible}
        draft={draftFilters}
        onChange={setDraftFilters}
        onApply={applyFilter}
        onReset={resetFilter}
        onCancel={() => setFilterVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  footer: { alignItems: 'center', paddingVertical: 16 },
  footerText: { color: LABEL_COLOR, fontSize: 12 },
});
