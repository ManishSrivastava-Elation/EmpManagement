/**
 * JobDetailsSkeleton — mirrors job-details.tsx layout:
 *   • JobDetailsCard:  header row + divider + title + description + badges + divider + date fields
 *   • CustomerDetailsCard: header row + divider + name + phone row + email + divider + address fields
 *   • EmployeeDetailsCard: header row + divider + name + phone/email row
 *   • Footer: full-width action button
 */
import React, { memo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SBone, useShimmerAnim, CARD_BORDER, DIVIDER_COLOR } from './SkeletonPrimitives';

const JobDetailsSkeleton = memo(function JobDetailsSkeleton() {
  const anim = useShimmerAnim();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── JobDetailsCard ────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <SBone w={32} h={32} r={8} anim={anim} />
            <SBone w={120} h={13} r={4} anim={anim} />
          </View>
          <View style={styles.divider} />
          {/* Job title */}
          <SBone w="75%" h={16} r={5} anim={anim} />
          {/* Description */}
          <SBone w="90%" h={13} r={4} anim={anim} />
          <SBone w="60%" h={13} r={4} anim={anim} />
          {/* Badges */}
          <View style={styles.badgeRow}>
            <SBone w={80} h={24} r={6} anim={anim} />
            <SBone w={70} h={24} r={6} anim={anim} />
          </View>
          <View style={styles.divider} />
          {/* Date fields */}
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <SBone w={50} h={10} r={3} anim={anim} />
              <SBone w="90%" h={12} r={4} anim={anim} />
            </View>
            <View style={styles.field}>
              <SBone w={45} h={10} r={3} anim={anim} />
              <SBone w="90%" h={12} r={4} anim={anim} />
            </View>
          </View>
        </View>

        {/* ── CustomerDetailsCard ───────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <SBone w={32} h={32} r={8} anim={anim} />
            <SBone w={150} h={13} r={4} anim={anim} />
          </View>
          <View style={styles.divider} />
          {/* Customer name */}
          <View style={styles.field}>
            <SBone w={90} h={10} r={3} anim={anim} />
            <SBone w="60%" h={12} r={4} anim={anim} />
          </View>
          {/* Phone row */}
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <SBone w={40} h={10} r={3} anim={anim} />
              <SBone w="80%" h={12} r={4} anim={anim} />
            </View>
            <View style={styles.field}>
              <SBone w={80} h={10} r={3} anim={anim} />
              <SBone w="80%" h={12} r={4} anim={anim} />
            </View>
          </View>
          {/* Email */}
          <View style={styles.field}>
            <SBone w={35} h={10} r={3} anim={anim} />
            <SBone w="70%" h={12} r={4} anim={anim} />
          </View>
          <View style={styles.divider} />
          {/* Address */}
          <View style={styles.field}>
            <SBone w={50} h={10} r={3} anim={anim} />
            <SBone w="85%" h={12} r={4} anim={anim} />
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <SBone w={30} h={10} r={3} anim={anim} />
              <SBone w="80%" h={12} r={4} anim={anim} />
            </View>
            <View style={styles.field}>
              <SBone w={35} h={10} r={3} anim={anim} />
              <SBone w="80%" h={12} r={4} anim={anim} />
            </View>
            <View style={styles.field}>
              <SBone w={45} h={10} r={3} anim={anim} />
              <SBone w="80%" h={12} r={4} anim={anim} />
            </View>
          </View>
        </View>

        {/* ── EmployeeDetailsCard ───────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <SBone w={32} h={32} r={8} anim={anim} />
            <SBone w={140} h={13} r={4} anim={anim} />
          </View>
          <View style={styles.divider} />
          <View style={styles.field}>
            <SBone w={90} h={10} r={3} anim={anim} />
            <SBone w="55%" h={12} r={4} anim={anim} />
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <SBone w={40} h={10} r={3} anim={anim} />
              <SBone w="80%" h={12} r={4} anim={anim} />
            </View>
            <View style={styles.field}>
              <SBone w={35} h={10} r={3} anim={anim} />
              <SBone w="80%" h={12} r={4} anim={anim} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Footer action button ──────────────────────────────────── */}
      <View style={styles.footer}>
        <SBone w="100%" h={48} r={10} anim={anim} />
      </View>
    </View>
  );
});

export default JobDetailsSkeleton;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5FB' },
  scroll: { padding: 14, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider: { height: 1, backgroundColor: DIVIDER_COLOR },
  badgeRow: { flexDirection: 'row', gap: 8 },
  fieldRow: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, gap: 4 },
  footer: {
    padding: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});
