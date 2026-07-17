import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { CustomersSkeleton } from '@/components/common/SkeletonLoader';
import NoActiveSubscription from '@/components/common/NoActiveSubscription';
import HeaderActionButton from '@/components/common/HeaderActionButton';
import CustomerCard from '@/components/company/customer/CustomerCard';
import CustomerFilterModal from '@/components/company/customer/CustomerFilterModal';
import CustomerListHeader from '@/components/company/customer/CustomerListHeader';
import CustomerEmptyState from '@/components/company/customer/CustomerEmptyState';
import { ActiveFilters, BG, DEFAULT_FILTERS, LABEL_COLOR } from '@/components/company/customer/constants';
import {
  getCustomers,
  type CustomerItem,
  type CustomerMeta,
  type CustomerFilters,
} from '@/services/company/customer.service';
import { theme } from '@/theme';

const LIMIT = 10;
const EMPTY_META: CustomerMeta = {
  page: 1, limit: LIMIT, total: 0, totalPages: 0,
  hasNextPage: false, hasPrevPage: false,
};

export default function CustomersScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActionButton
          visible={true}
          title="Add Customer"
          onPress={() => router.push('/(company)/add-customer')}
        />
      ),
    });
  }, [navigation]);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [meta, setMeta] = useState<CustomerMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noSubscription, setNoSubscription] = useState(false);

  // ── Search ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (activeFilters.city) n++;
    if (activeFilters.state) n++;
    if (activeFilters.startDate) n++;
    if (activeFilters.endDate) n++;
    if (activeFilters.sortBy !== 'created_at' || activeFilters.order !== 'DESC') n++;
    return n;
  }, [activeFilters]);

  // ── API ─────────────────────────────────────────────────────────────────────
  const buildFilters = useCallback((page: number): CustomerFilters => {
    const f: CustomerFilters = { page, limit: LIMIT };
    if (debouncedSearch.trim()) f.search = debouncedSearch.trim();
    if (activeFilters.city) f.city = activeFilters.city;
    if (activeFilters.state) f.state = activeFilters.state;
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
      const res = await getCustomers(buildFilters(page));
      if ((res as any)?.statusCode === 403 && (res as any)?.message === 'No active subscription found') {
        setNoSubscription(true);
        return;
      }
      setNoSubscription(false);
      setCustomers(prev =>
        append && page > 1 ? [...prev, ...(res.data ?? [])] : (res.data ?? [])
      );
      setMeta(res.meta ?? EMPTY_META);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load customers. Please try again.');
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

  // ── Filter handlers ─────────────────────────────────────────────────────────
  const openFilter = useCallback(() => { setDraftFilters(activeFilters); setFilterVisible(true); }, [activeFilters]);
  const applyFilter = useCallback(() => { setActiveFilters(draftFilters); setFilterVisible(false); }, [draftFilters]);
  const resetFilter = useCallback(() => { setDraftFilters(DEFAULT_FILTERS); setActiveFilters(DEFAULT_FILTERS); setFilterVisible(false); }, []);

  // ── FlatList ────────────────────────────────────────────────────────────────
  const keyExtractor = useCallback((item: CustomerItem) => String(item.id), []);
  const renderItem = useCallback(({ item }: { item: CustomerItem }) => <CustomerCard item={item} />, []);

  const ListHeader = useMemo(() => (
    <CustomerListHeader
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onClearSearch={() => setSearchQuery('')}
      activeFilterCount={activeFilterCount}
      totalCustomers={meta.total}
      onOpenFilter={openFilter}
    />
  ), [searchQuery, activeFilterCount, meta.total, openFilter]);

  const ListEmpty = useMemo(() => (
    loading ? null : (
      <CustomerEmptyState
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
    ) : !meta.hasNextPage && customers.length > 0 ? (
      <View style={styles.footer}>
        <Text style={styles.footerText}>No more customers</Text>
      </View>
    ) : null
  ), [loadingMore, meta.hasNextPage, customers.length]);

  if (loading && !refreshing) return <CustomersSkeleton />;

  if (noSubscription) return <NoActiveSubscription />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={customers}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={10}
        maxToRenderPerBatch={8}
      />

      <CustomerFilterModal
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
  listContent: { paddingHorizontal: 14, paddingBottom: 100 },
  footer: { alignItems: 'center', paddingVertical: 16 },
  footerText: { color: LABEL_COLOR, fontSize: 12 },
});
