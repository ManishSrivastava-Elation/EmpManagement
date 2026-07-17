/**
 * CompanyProfileSkeleton — mirrors company Profile.tsx layout:
 *   • Company card: logo box(80) + name + id badge + status pill
 *   • Contact Person card: header + divider + avatar(56) + name + designation
 *   • Contact Information card: header + divider + 2 × info rows (iconCircle + label + value)
 *   • Active Subscription card: header + status pill + plan box (icon + name + price + divider + footer row)
 *   • Quick actions card: header + divider + 3 action buttons
 */
import React, { memo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SBone, useShimmerAnim, CARD_BORDER, DIVIDER_COLOR } from './SkeletonPrimitives';

const CompanyProfileSkeleton = memo(function CompanyProfileSkeleton() {
  const anim = useShimmerAnim();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── Company card ──────────────────────────────────────────── */}
        <View style={[styles.card, styles.companyCard]}>
          {/* Logo box */}
          <SBone w={80} h={80} r={8} anim={anim} style={styles.logoMargin} />
          <View style={styles.companyInfo}>
            <SBone w={160} h={20} r={5} anim={anim} style={styles.mb8} />
            <SBone w={130} h={24} r={8} anim={anim} style={styles.mb8} />
            <SBone w={80} h={24} pill anim={anim} />
          </View>
        </View>

        {/* ── Contact Person card ───────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <SBone w={18} h={18} circle anim={anim} />
            <SBone w={120} h={15} r={4} anim={anim} />
          </View>
          <View style={styles.divider} />
          <View style={styles.contactPersonRow}>
            <SBone w={56} h={56} circle anim={anim} style={styles.avatarMargin} />
            <View style={styles.contactText}>
              <SBone w={130} h={16} r={4} anim={anim} style={styles.mb6} />
              <SBone w={90} h={13} r={4} anim={anim} />
            </View>
          </View>
        </View>

        {/* ── Contact Information card ──────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <SBone w={18} h={18} circle anim={anim} />
            <SBone w={150} h={15} r={4} anim={anim} />
          </View>
          <View style={styles.divider} />
          {/* Email row */}
          <View style={styles.infoRow}>
            <SBone w={36} h={36} circle anim={anim} style={styles.iconMargin} />
            <View style={styles.infoText}>
              <SBone w={40} h={13} r={4} anim={anim} />
              <SBone w={160} h={11} r={4} anim={anim} style={styles.mt2} />
            </View>
          </View>
          <View style={styles.divider} />
          {/* Phone row */}
          <View style={styles.infoRow}>
            <SBone w={36} h={36} circle anim={anim} style={styles.iconMargin} />
            <View style={styles.infoText}>
              <SBone w={45} h={13} r={4} anim={anim} />
              <SBone w={110} h={11} r={4} anim={anim} style={styles.mt2} />
            </View>
          </View>
        </View>

        {/* ── Active Subscription card ──────────────────────────────── */}
        <View style={styles.card}>
          {/* Sub header: title + status pill */}
          <View style={styles.subHeaderRow}>
            <View style={styles.headerRow}>
              <SBone w={18} h={18} circle anim={anim} />
              <SBone w={140} h={15} r={4} anim={anim} />
            </View>
            <SBone w={80} h={26} pill anim={anim} />
          </View>
          {/* Plan box */}
          <View style={styles.planBox}>
            {/* Plan row: icon + name + price */}
            <View style={styles.planRow}>
              <SBone w={48} h={48} r={8} anim={anim} style={styles.planIconMargin} />
              <View style={styles.planInfo}>
                <SBone w={100} h={16} r={4} anim={anim} />
              </View>
              <SBone w={60} h={17} r={4} anim={anim} />
            </View>
            <View style={styles.planDivider} />
            {/* Footer row: expires + days remaining */}
            <View style={styles.planFooterRow}>
              <View style={styles.planFooterItem}>
                <SBone w={16} h={16} circle anim={anim} />
                <View style={styles.footerText}>
                  <SBone w={55} h={11} r={3} anim={anim} style={styles.mb4} />
                  <SBone w={80} h={13} r={4} anim={anim} />
                </View>
              </View>
              <View style={styles.footerSeparator} />
              <View style={styles.planFooterItem}>
                <SBone w={16} h={16} circle anim={anim} />
                <View style={styles.footerText}>
                  <SBone w={80} h={11} r={3} anim={anim} style={styles.mb4} />
                  <SBone w={55} h={13} r={4} anim={anim} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Quick actions card ────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
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

export default CompanyProfileSkeleton;

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
  companyCard: { flexDirection: 'row', alignItems: 'flex-start' },
  logoMargin: { marginRight: 16 },
  companyInfo: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  divider: { height: 1, backgroundColor: DIVIDER_COLOR, marginVertical: 12 },
  contactPersonRow: { flexDirection: 'row', alignItems: 'center' },
  avatarMargin: { marginRight: 14 },
  contactText: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconMargin: { marginRight: 10 },
  infoText: { flex: 1 },
  planBox: {
    backgroundColor: '#F3F5F9',
    borderRadius: 8,
    padding: 14,
  },
  planRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  planIconMargin: { marginRight: 12 },
  planInfo: { flex: 1 },
  planDivider: { height: 1, backgroundColor: '#EEF0F4', marginBottom: 12 },
  planFooterRow: { flexDirection: 'row', alignItems: 'center' },
  planFooterItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerSeparator: { width: 1, height: 32, backgroundColor: '#EEF0F4', marginHorizontal: 10 },
  footerText: { gap: 2 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: CARD_BORDER,
  },
  mb4: { marginBottom: 4 },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mt2: { marginTop: 2 },
});
