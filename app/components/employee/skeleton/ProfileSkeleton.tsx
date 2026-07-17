/**
 * ProfileSkeleton — mirrors profile.tsx layout:
 *   • Profile card: avatar circle(90) + name + badge pill + company row
 *   • Profile details card: header row + 4 × info rows (iconCircle + label + value)
 *   • Quick actions card: header row + 3 action buttons
 */
import React, { memo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SBone, useShimmerAnim, CARD_BORDER, DIVIDER_COLOR } from './SkeletonPrimitives';

const ProfileSkeleton = memo(function ProfileSkeleton() {
  const anim = useShimmerAnim();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── Profile card ─────────────────────────────────────────── */}
        <View style={[styles.card, styles.profileCard]}>
          {/* Avatar circle */}
          <SBone w={90} h={90} circle anim={anim} style={styles.avatarMargin} />
          {/* Name */}
          <SBone w={160} h={20} r={6} anim={anim} style={styles.nameMargin} />
          {/* Employee code badge */}
          <SBone w={100} h={26} pill anim={anim} style={styles.badgeMargin} />
          {/* Company row: icon + text */}
          <View style={styles.inlineRow}>
            <SBone w={14} h={14} circle anim={anim} />
            <SBone w={120} h={14} r={4} anim={anim} />
          </View>
        </View>

        {/* ── Profile details card ──────────────────────────────────── */}
        <View style={styles.card}>
          {/* Card header */}
          <View style={styles.cardHeaderRow}>
            <SBone w={18} h={18} circle anim={anim} />
            <SBone w={110} h={15} r={4} anim={anim} />
          </View>
          <View style={styles.divider} />

          {/* 4 info rows */}
          {INFO_ROWS.map(i => (
            <View key={i}>
              <View style={styles.infoRow}>
                <SBone w={36} h={36} circle anim={anim} style={styles.iconCircleMargin} />
                <View style={styles.infoText}>
                  <SBone w={60} h={13} r={4} anim={anim} />
                  <SBone w={140} h={11} r={4} anim={anim} style={styles.infoValueMargin} />
                </View>
              </View>
              {i < INFO_ROWS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* ── Quick actions card ────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <SBone w={18} h={18} circle anim={anim} />
            <SBone w={100} h={15} r={4} anim={anim} />
          </View>
          <View style={styles.divider} />
          <View style={styles.actionsRow}>
            {ACTION_KEYS.map(i => (
              <View key={i} style={styles.actionBtn}>
                <SBone w={20} h={20} circle anim={anim} />
                <SBone w={60} h={11} r={4} anim={anim} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

export default ProfileSkeleton;

const INFO_ROWS = [0, 1, 2, 3];
const ACTION_KEYS = [0, 1, 2];

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F5F9' },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0B1A3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 1,
  },
  profileCard: { alignItems: 'center', paddingVertical: 24 },
  avatarMargin: { marginBottom: 16 },
  nameMargin: { marginBottom: 8 },
  badgeMargin: { marginBottom: 8 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider: { height: 1, backgroundColor: DIVIDER_COLOR, marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircleMargin: { marginRight: 10 },
  infoText: { flex: 1, gap: 4 },
  infoValueMargin: { marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: CARD_BORDER,
  },
});
