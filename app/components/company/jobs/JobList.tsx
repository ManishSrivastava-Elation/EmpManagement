import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import JobCard from './JobCard';
import type { JobItem } from '@/services/company/job.service';

type Props = {
  data: JobItem[];
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
};

export default function JobList({
  data,
  refreshing,
  onRefresh,
  onEndReached,
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
}: Props) {
  const renderItem = useCallback(({ item }: { item: JobItem }) => <JobCard item={item} />, []);
  const keyExtractor = useCallback((item: JobItem) => String(item.id), []);

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
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
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 100,
  },
});
