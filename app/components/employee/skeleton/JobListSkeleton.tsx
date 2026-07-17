/**
 * JobListSkeleton — mirrors job.tsx + JobCard layout:
 *   • Search bar + filter button
 *   • Records label
 *   • 4 × JobCard:
 *       Top: avatarBox(50) + title + priority badge + status badge
 *       Divider
 *       Section heading: iconBox(24) + label
 *       Field row: 2 × (label + value)
 *       Divider
 *       Section heading
 *       Description line + field row
 *       Divider
 *       View details button
 */
import React, { memo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SBone, useShimmerAnim, BONE_COLOR, CARD_BORDER, DIVIDER_COLOR } from './SkeletonPrimitives';

const JobListSkeleton = memo(function JobListSkeleton() {
  const anim = useShimmerAnim();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── Search bar + filter button ────────────────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <SBone w={18} h={18} circle anim={anim} />
            <SBone w="70%" h={14} r={4} anim={anim} style={{ flex: 1 }} />
          </View>
          <SBone w={44} h={46} r={8} anim={anim} />
        </View>

        {/* ── Records label ─────────────────────────────────────────── */}
        <SBone w={80} h={12} r={4} anim={anim} style={styles.recordsLabel} />

        {/* ── Job cards ─────────────────────────────────────────────── */}
        {JOB_CARD_KEYS.map(i => (
          <View key={i} style={styles.card}>
            {/* Top: avatar + title + badges */}
            <View style={styles.cardTop}>
              <SBone w={50} h={50} circle anim={anim} />
              <View style={styles.cardTopCenter}>
                <SBone w="70%" h={15} r={4} anim={anim} />
                <View style={styles.badgeRow}>
                  <SBone w={70} h={20} r={4} anim={anim} />
                  <SBone w={60} h={20} r={4} anim={anim} />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Section: Customer Details */}
            <View style={styles.sectionHead}>
              <SBone w={24} h={24} r={6} anim={anim} />
              <SBone w={110} h={12} r={4} anim={anim} />
            </View>
            <View style={styles.fieldRow}>
              <View style={styles.field}>
                <SBone w={80} h={10} r={3} anim={anim} />
                <SBone w="90%" h={12} r={4} anim={anim} />
              </View>
              <View style={styles.field}>
                <SBone w={40} h={10} r={3} anim={anim} />
                <SBone w="80%" h={12} r={4} anim={anim} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Section: Job Information */}
            <View style={styles.sectionHead}>
              <SBone w={24} h={24} r={6} anim={anim} />
              <SBone w={100} h={12} r={4} anim={anim} />
            </View>
            <SBone w="85%" h={11} r={4} anim={anim} style={styles.descLine} />
            <View style={styles.fieldRow}>
              <View style={styles.field}>
                <SBone w={50} h={10} r={3} anim={anim} />
                <SBone w="90%" h={12} r={4} anim={anim} />
              </View>
              <View style={styles.field}>
                <SBone w={70} h={10} r={3} anim={anim} />
                <SBone w="90%" h={12} r={4} anim={anim} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* View details button */}
            <SBone w="100%" h={36} r={6} anim={anim} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export default JobListSkeleton;

const JOB_CARD_KEYS = [0, 1, 2, 3];

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5FB' },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: CARD_BORDER,
    borderRadius: 8, paddingHorizontal: 14, height: 46,
  },
  recordsLabel: { marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e6e7',
    padding: 14,
    marginBottom: 8,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTopCenter: { flex: 1, gap: 8 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  divider: { height: 1, backgroundColor: DIVIDER_COLOR },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldRow: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, gap: 4 },
  descLine: { marginBottom: 4 },
});
