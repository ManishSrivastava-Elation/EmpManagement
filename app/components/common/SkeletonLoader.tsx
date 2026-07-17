/**
 * components/common/SkeletonLoader.tsx
 *
 * ─── Public API ───────────────────────────────────────────────────────────────
 *
 *  Default export  : SkeletonLoader               — generic configurable loader (unchanged API)
 *  Named exports   : EmployeesSkeleton            — employees screen skeleton
 *                    AttendanceSkeleton           — attendance screen skeleton
 *                    ExpenseSkeleton              — expense screen skeleton
 *                    DashboardSkeleton            — company dashboard screen skeleton
 *                    EmployeeAttendanceSkeleton   — employee attendance screen skeleton
 *                    EmployeeExpenseSkeleton      — employee expense screen skeleton
 *
 * All variants share:
 *   • useShimmerAnim()  — single shimmer loop hook
 *   • SBone             — lightweight memo'd bone primitive
 *   • React.memo        — optimised re-render prevention
 */

import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

// Matches index.tsx: CARD_WIDTH = (SCREEN_WIDTH - 52) / 2
const _SCREEN_WIDTH = Dimensions.get('window').width;
const _DASH_CARD_W = (_SCREEN_WIDTH - 52) / 2;

// ─── Color tokens ─────────────────────────────────────────────────────────────

const BONE_COLOR = '#E8ECF0';
const SHIMMER_COLOR = 'rgba(255,255,255,0.78)';
const CARD_BORDER = '#E5E7EB';
const DIVIDER_COLOR = '#f1f2f4';

// ─── Generic types (unchanged public API) ─────────────────────────────────────

type CircleItem  = { shape: 'circle'; size: number };
type LinesItem   = { shape: 'lines'; lines: number[]; lineHeight?: number; gap?: number };
type PillItem    = { shape: 'pill'; width: number; height?: number };
type RectItem    = { shape: 'rect'; width: number | `${number}%`; height: number; radius?: number };
type SpacerItem  = { shape: 'spacer' };

export type SkeletonItem = CircleItem | LinesItem | PillItem | RectItem | SpacerItem;

export type SkeletonRow = {
  items: SkeletonItem[];
  marginTop?: number;
  align?: 'flex-start' | 'center' | 'flex-end';
  gap?: number;
};

export type SkeletonPreset =
  | 'leadCard'
  | 'profileCard'
  | 'listRow'
  | 'mediaCard'
  | 'businessHero'
  | 'generalInfo'
  | 'attendanceScreen'
  | 'employeeCard'
  | 'expenseScreen';

type SkeletonLoaderProps = {
  preset?: SkeletonPreset;
  rows?: SkeletonRow[];
  count?: number;
  cardColor?: string;
  boneColor?: string;
  shimmerColor?: string;
  cardRadius?: number;
  cardPadding?: number;
  dividerAfterRow?: number;
  staggerDelay?: number;
  containerStyle?: ViewStyle;
};

// ─── Presets (unchanged) ──────────────────────────────────────────────────────

const PRESETS: Record<SkeletonPreset, SkeletonRow[]> = {
  leadCard: [
    {
      items: [
        { shape: 'circle', size: 44 },
        { shape: 'lines', lines: [55, 38], lineHeight: 13, gap: 8 },
        { shape: 'spacer' },
        { shape: 'pill', width: 64, height: 24 },
      ],
      align: 'center',
      gap: 12,
    },
    {
      items: [
        { shape: 'lines', lines: [70, 90], lineHeight: 11, gap: 7 },
        { shape: 'lines', lines: [65, 85], lineHeight: 11, gap: 7 },
        { shape: 'lines', lines: [60, 80], lineHeight: 11, gap: 7 },
      ],
      marginTop: spacing.md,
      gap: 0,
      align: 'flex-start',
    },
    {
      items: [
        { shape: 'pill', width: 72 },
        { shape: 'pill', width: 90 },
        { shape: 'pill', width: 60 },
      ],
      marginTop: spacing.md,
      gap: 8,
    },
    {
      items: [
        { shape: 'rect', width: '100%', height: 40, radius: 10 },
        { shape: 'rect', width: '100%', height: 40, radius: 10 },
      ],
      marginTop: spacing.md,
      gap: 10,
    },
  ],

  profileCard: [
    {
      items: [{ shape: 'spacer' }, { shape: 'circle', size: 64 }, { shape: 'spacer' }],
      align: 'center',
    },
    {
      items: [{ shape: 'lines', lines: [50, 30], lineHeight: 14, gap: 8 }],
      marginTop: spacing.md,
      align: 'center',
    },
    {
      items: [
        { shape: 'spacer' },
        { shape: 'pill', width: 70 },
        { shape: 'pill', width: 70 },
        { shape: 'spacer' },
      ],
      marginTop: spacing.md,
      gap: 8,
      align: 'center',
    },
    {
      items: [{ shape: 'rect', width: '100%', height: 36, radius: 18 }],
      marginTop: spacing.lg,
    },
  ],

  listRow: [
    {
      items: [
        { shape: 'circle', size: 36 },
        { shape: 'lines', lines: [60, 40], lineHeight: 12, gap: 7 },
        { shape: 'spacer' },
        { shape: 'pill', width: 52, height: 20 },
      ],
      align: 'center',
      gap: 12,
    },
  ],

  mediaCard: [
    { items: [{ shape: 'rect', width: '100%', height: 140, radius: 10 }] },
    {
      items: [{ shape: 'lines', lines: [80, 60, 45], lineHeight: 12, gap: 8 }],
      marginTop: spacing.md,
    },
    {
      items: [
        { shape: 'pill', width: 80 },
        { shape: 'spacer' },
        { shape: 'pill', width: 52 },
      ],
      marginTop: spacing.md,
      align: 'center',
      gap: 8,
    },
  ],

  businessHero: [
    {
      items: [
        { shape: 'circle', size: 72 },
        { shape: 'spacer' },
        { shape: 'pill', width: 60, height: 28 },
      ],
      gap: 12,
      align: 'flex-start',
    },
    {
      items: [{ shape: 'lines', lines: [65], lineHeight: 24, gap: 0 }],
      marginTop: spacing.md,
    },
    {
      items: [{ shape: 'lines', lines: [45], lineHeight: 14, gap: 0 }],
      marginTop: spacing.xs,
    },
    {
      items: [{ shape: 'pill', width: 85, height: 26 }],
      marginTop: spacing.md,
    },
  ],

  attendanceScreen: [
    {
      items: [
        { shape: 'circle', size: 36 },
        { shape: 'spacer' },
        { shape: 'lines', lines: [42], lineHeight: 16, gap: 0 },
        { shape: 'spacer' },
        { shape: 'circle', size: 36 },
      ],
      align: 'center',
      gap: 8,
    },
    {
      items: [
        { shape: 'rect', width: '100%', height: 74, radius: 12 },
        { shape: 'rect', width: '100%', height: 74, radius: 12 },
        { shape: 'rect', width: '100%', height: 74, radius: 12 },
        { shape: 'rect', width: '100%', height: 74, radius: 12 },
      ],
      marginTop: spacing.md,
      gap: 8,
    },
    {
      items: [
        { shape: 'rect', width: 44, height: 48, radius: 10 },
        { shape: 'lines', lines: [60, 40, 30], lineHeight: 12, gap: 5 },
        { shape: 'spacer' },
        { shape: 'pill', width: 72, height: 24 },
      ],
      marginTop: spacing.md,
      align: 'center',
      gap: 12,
    },
    {
      items: [
        { shape: 'rect', width: 44, height: 48, radius: 10 },
        { shape: 'lines', lines: [55, 38, 28], lineHeight: 12, gap: 5 },
        { shape: 'spacer' },
        { shape: 'pill', width: 72, height: 24 },
      ],
      marginTop: spacing.sm,
      align: 'center',
      gap: 12,
    },
    {
      items: [
        { shape: 'rect', width: 44, height: 48, radius: 10 },
        { shape: 'lines', lines: [60, 42, 32], lineHeight: 12, gap: 5 },
        { shape: 'spacer' },
        { shape: 'pill', width: 72, height: 24 },
      ],
      marginTop: spacing.sm,
      align: 'center',
      gap: 12,
    },
  ],

  employeeCard: [
    {
      items: [
        { shape: 'circle', size: 45 },
        { shape: 'lines', lines: [55, 35], lineHeight: 13, gap: 6 },
        { shape: 'spacer' },
        { shape: 'pill', width: 72, height: 28 },
      ],
      align: 'center',
      gap: 12,
    },
    {
      items: [
        { shape: 'lines', lines: [65, 45], lineHeight: 13, gap: 8 },
        { shape: 'rect', width: 84, height: 32, radius: 6 },
      ],
      marginTop: spacing.xs,
      align: 'center',
      gap: 12,
    },
    {
      items: [{ shape: 'rect', width: '100%', height: 1, radius: 0 }],
      marginTop: spacing.sm,
    },
    {
      items: [
        { shape: 'circle', size: 14 },
        { shape: 'lines', lines: [65], lineHeight: 12, gap: 0 },
      ],
      marginTop: spacing.sm,
      align: 'center',
      gap: 6,
    },
  ],

  expenseScreen: [
    {
      items: [
        { shape: 'circle', size: 36 },
        { shape: 'spacer' },
        { shape: 'lines', lines: [42], lineHeight: 16, gap: 0 },
        { shape: 'spacer' },
        { shape: 'circle', size: 36 },
      ],
      align: 'center',
      gap: 8,
    },
    {
      items: [
        { shape: 'rect', width: '100%', height: 74, radius: 12 },
        { shape: 'rect', width: '100%', height: 74, radius: 12 },
        { shape: 'rect', width: '100%', height: 74, radius: 12 },
        { shape: 'rect', width: '100%', height: 74, radius: 12 },
      ],
      marginTop: spacing.md,
      gap: 8,
    },
    {
      items: [
        { shape: 'rect', width: '100%', height: 44, radius: 10 },
        { shape: 'pill', width: 112, height: 44 },
      ],
      marginTop: spacing.md,
      gap: 8,
      align: 'center',
    },
    {
      items: [
        { shape: 'rect', width: 44, height: 48, radius: 12 },
        { shape: 'lines', lines: [55, 40, 30], lineHeight: 12, gap: 4 },
        { shape: 'spacer' },
        { shape: 'lines', lines: [50], lineHeight: 15, gap: 0 },
      ],
      marginTop: spacing.md,
      align: 'center',
      gap: 10,
    },
    {
      items: [
        { shape: 'rect', width: 44, height: 48, radius: 12 },
        { shape: 'lines', lines: [50, 38, 28], lineHeight: 12, gap: 4 },
        { shape: 'spacer' },
        { shape: 'lines', lines: [50], lineHeight: 15, gap: 0 },
      ],
      marginTop: spacing.sm,
      align: 'center',
      gap: 10,
    },
    {
      items: [
        { shape: 'rect', width: 44, height: 48, radius: 12 },
        { shape: 'lines', lines: [58, 42, 32], lineHeight: 12, gap: 4 },
        { shape: 'spacer' },
        { shape: 'lines', lines: [50], lineHeight: 15, gap: 0 },
      ],
      marginTop: spacing.sm,
      align: 'center',
      gap: 10,
    },
  ],

  generalInfo: [
    {
      items: [
        { shape: 'circle', size: 22 },
        { shape: 'lines', lines: [35], lineHeight: 18, gap: 0 },
        { shape: 'spacer' },
      ],
      gap: 10,
      align: 'center',
    },
    {
      items: [{ shape: 'rect', width: '100%', height: 1, radius: 0 }],
      marginTop: spacing.md,
    },
    {
      items: [
        { shape: 'lines', lines: [40], lineHeight: 16, gap: 0 },
        { shape: 'spacer' },
        { shape: 'lines', lines: [55], lineHeight: 16, gap: 0 },
      ],
      marginTop: spacing.md,
      gap: 8,
      align: 'center',
    },
    {
      items: [{ shape: 'rect', width: '100%', height: 1, radius: 0 }],
      marginTop: spacing.md,
    },
    {
      items: [
        { shape: 'lines', lines: [38], lineHeight: 16, gap: 0 },
        { shape: 'spacer' },
        { shape: 'lines', lines: [50], lineHeight: 16, gap: 0 },
      ],
      marginTop: spacing.md,
      gap: 8,
      align: 'center',
    },
    {
      items: [{ shape: 'rect', width: '100%', height: 1, radius: 0 }],
      marginTop: spacing.md,
    },
    {
      items: [
        { shape: 'lines', lines: [35], lineHeight: 16, gap: 0 },
        { shape: 'spacer' },
        { shape: 'pill', width: 85, height: 26 },
      ],
      marginTop: spacing.md,
      gap: 8,
      align: 'center',
    },
  ],
};

// ─── Shared shimmer animation hook ────────────────────────────────────────────

function useShimmerAnim(): Animated.Value {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return anim;
}

// ─── Bone primitive ───────────────────────────────────────────────────────────

type BoneProps = {
  width: number | `${number}%`;
  height: number;
  borderRadius: number;
  boneColor: string;
  shimmerColor: string;
  anim: Animated.Value;
  style?: ViewStyle;
};

const Bone = memo(function Bone({
  width,
  height,
  borderRadius,
  boneColor,
  shimmerColor,
  anim,
  style,
}: BoneProps) {
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  return (
    <View
      style={[{ width, height, borderRadius, backgroundColor: boneColor, overflow: 'hidden' }, style]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            width: '55%',
            backgroundColor: shimmerColor,
            transform: [{ skewX: '-18deg' }, { translateX }],
          },
        ]}
      />
    </View>
  );
});

// ─── SBone — lightweight shorthand for page-variant skeletons ─────────────────
//
//  Instead of the verbose per-element <SkeletonLoader cardColor="transparent"
//  cardPadding={0} count={1} rows={[...]} containerStyle={{ padding:0 }} />
//  that was previously scattered across the inline skeleton functions, the
//  page-variant components use <SBone> directly — 3 props instead of 6.

type SBoneProps = {
  /** Width in px or % string */
  w: number | `${number}%`;
  /** Height in px */
  h: number;
  /** Border radius (default 6) */
  r?: number;
  /** If true, renders as a full circle (r = w/2) */
  circle?: boolean;
  /** If true, renders as a pill (r = 999) */
  pill?: boolean;
  /** Extra style on the outer bone view */
  style?: ViewStyle;
  anim: Animated.Value;
};

const SBone = memo(function SBone({ w, h, r = 6, circle, pill, style, anim }: SBoneProps) {
  const radius = circle ? (w as number) / 2 : pill ? 999 : r;
  return (
    <Bone
      width={w}
      height={h}
      borderRadius={radius}
      boneColor={BONE_COLOR}
      shimmerColor={SHIMMER_COLOR}
      anim={anim}
      style={style}
    />
  );
});

// ─── Row renderer (generic) ───────────────────────────────────────────────────

type RowRendererProps = {
  row: SkeletonRow;
  anim: Animated.Value;
  boneColor: string;
  shimmerColor: string;
};

const RowRenderer = memo(function RowRenderer({
  row,
  anim,
  boneColor,
  shimmerColor,
}: RowRendererProps) {
  const bp = { anim, boneColor, shimmerColor };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: row.align ?? 'center',
        marginTop: row.marginTop ?? 0,
        gap: row.gap ?? 8,
      }}
    >
      {row.items.map((item, i) => {
        if (item.shape === 'spacer') return <View key={i} style={{ flex: 1 }} />;

        if (item.shape === 'circle')
          return (
            <Bone
              key={i}
              width={item.size}
              height={item.size}
              borderRadius={item.size / 2}
              {...bp}
            />
          );

        if (item.shape === 'pill')
          return (
            <Bone
              key={i}
              width={item.width}
              height={item.height ?? 26}
              borderRadius={99}
              {...bp}
            />
          );

        if (item.shape === 'rect')
          return (
            <Bone
              key={i}
              width={item.width}
              height={item.height}
              borderRadius={item.radius ?? 8}
              style={{ flex: item.width === '100%' ? 1 : undefined }}
              {...bp}
            />
          );

        if (item.shape === 'lines') {
          const lh = item.lineHeight ?? 13;
          const gap = item.gap ?? 8;
          return (
            <View key={i} style={{ flex: 1, gap }}>
              {item.lines.map((pct, li) => (
                <Bone
                  key={li}
                  width={`${pct}%`}
                  height={lh}
                  borderRadius={5}
                  {...bp}
                />
              ))}
            </View>
          );
        }

        return null;
      })}
    </View>
  );
});

// ─── Single skeleton card (generic) ──────────────────────────────────────────

type SkeletonCardProps = {
  rows: SkeletonRow[];
  anim: Animated.Value;
  cardColor: string;
  cardRadius: number;
  cardPadding: number;
  boneColor: string;
  shimmerColor: string;
  dividerAfterRow?: number;
  entryAnim: Animated.Value;
};

function SkeletonCard({
  rows,
  anim,
  cardColor,
  cardRadius,
  cardPadding,
  boneColor,
  shimmerColor,
  dividerAfterRow,
  entryAnim,
}: SkeletonCardProps) {
  return (
    <Animated.View
      style={[
        genericStyles.card,
        {
          backgroundColor: cardColor,
          borderRadius: cardRadius,
          padding: cardPadding,
          opacity: entryAnim,
          transform: [
            {
              translateY: entryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      {rows.map((row, i) => (
        <View key={i}>
          <RowRenderer row={row} anim={anim} boneColor={boneColor} shimmerColor={shimmerColor} />
          {dividerAfterRow === i && (
            <View style={[genericStyles.divider, { marginVertical: spacing.md }]} />
          )}
        </View>
      ))}
    </Animated.View>
  );
}

// ─── Default export — generic configurable SkeletonLoader ────────────────────

export default function SkeletonLoader({
  preset,
  rows,
  count = 1,
  cardColor,
  boneColor = BONE_COLOR,
  shimmerColor = SHIMMER_COLOR,
  cardRadius = 16,
  cardPadding = 6,
  dividerAfterRow,
  staggerDelay = 60,
  containerStyle,
}: SkeletonLoaderProps) {
  const resolvedRows = rows ?? (preset ? PRESETS[preset] : PRESETS.leadCard);
  const resolvedCardColor = cardColor ?? (colors.white || '#FFFFFF');

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const entryAnims = useRef(
    Array.from({ length: count }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();

    const entries = entryAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 320,
        delay: i * staggerDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    Animated.parallel(entries).start();

    return () => loop.stop();
  }, []);

  return (
    <View style={[genericStyles.container, containerStyle]}>
      {entryAnims.map((entryAnim, i) => (
        <SkeletonCard
          key={i}
          rows={resolvedRows}
          anim={shimmerAnim}
          cardColor={resolvedCardColor}
          cardRadius={cardRadius}
          cardPadding={cardPadding}
          boneColor={boneColor}
          shimmerColor={shimmerColor}
          dividerAfterRow={dividerAfterRow}
          entryAnim={entryAnim}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE-LEVEL SKELETON VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
//
//  Each variant:
//   1. Calls useShimmerAnim() for a shared loop
//   2. Uses <SBone> for all individual shimmer elements
//   3. Mirrors the exact spacing / layout of the real screen
//   4. Is wrapped in React.memo
//

// ─── EmployeesSkeleton ────────────────────────────────────────────────────────
//
//  Layout mirrors employees.tsx:
//    • Search bar       (height: 46, borderRadius: 8)
//    • 7 × Employee card
//        Row 1: avatar(45) + name/code lines + status pill(72×28)
//        Row 2: email icon+line / phone icon+line | block button(84×32)
//        Divider
//        Row 3: calendar icon + date line
//

export const EmployeesSkeleton = memo(function EmployeesSkeleton() {
  const anim = useShimmerAnim();

  return (
    <View style={empStyles.root}>
      <ScrollView
        contentContainerStyle={empStyles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── Search bar ─────────────────────────────────────────────── */}
        <View style={empStyles.searchBar}>
          {/* search icon */}
          <SBone w={18} h={18} circle anim={anim} />
          {/* placeholder text */}
          <SBone w="70%" h={14} r={4} anim={anim} style={empStyles.searchText} />
        </View>

        {/* ── Employee cards ─────────────────────────────────────────── */}
        {EMPLOYEE_CARD_WIDTHS.map((_, idx) => (
          <View key={idx} style={empStyles.card}>
            {/* Row 1: avatar + name/code + status pill */}
            <View style={empStyles.row}>
              <View style={empStyles.avatarGroup}>
                <SBone w={45} h={45} circle anim={anim} />
                <View style={empStyles.nameBlock}>
                  <SBone w="55%" h={16} r={4} anim={anim} />
                  <SBone w="35%" h={12} r={4} anim={anim} />
                </View>
              </View>
              <SBone w={72} h={28} pill anim={anim} />
            </View>

            {/* Row 2: email + phone | block button */}
            <View style={[empStyles.row, empStyles.contactRow]}>
              <View style={empStyles.contactLines}>
                {/* email */}
                <View style={empStyles.iconLine}>
                  <SBone w={15} h={15} circle anim={anim} />
                  <SBone w="60%" h={13} r={4} anim={anim} style={{ flex: 1 }} />
                </View>
                {/* phone */}
                <View style={empStyles.iconLine}>
                  <SBone w={15} h={15} circle anim={anim} />
                  <SBone w="45%" h={13} r={4} anim={anim} style={{ flex: 1 }} />
                </View>
              </View>
              <SBone w={84} h={32} r={6} anim={anim} />
            </View>

            {/* Divider */}
            <View style={empStyles.divider} />

            {/* Row 3: calendar icon + registered date */}
            <View style={empStyles.iconLine}>
              <SBone w={14} h={14} circle anim={anim} />
              <SBone w="65%" h={12} r={4} anim={anim} style={{ flex: 1 }} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

// 7 cards — varying widths drive no visual difference but serve as unique keys
const EMPLOYEE_CARD_WIDTHS = [0, 1, 2, 3, 4, 5, 6];

const empStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFB',
    marginTop: 10,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  // Search bar: exact match to real screen's searchBox style
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
  },
  searchText: {
    flex: 1,
  },
  // Employee card: exact match to real EmployeeCard wrapper
  card: {
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e6e7',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  contactRow: {
    marginTop: 2,
  },
  contactLines: {
    flex: 1,
    gap: 6,
  },
  iconLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  divider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
    marginVertical: 3,
  },
});

// ─── AttendanceSkeleton ───────────────────────────────────────────────────────
//
//  Layout mirrors attendance.tsx:
//    • Header: title(140×26) | share-report pill + date-range pill
//    • MonthNavigator: circle + month/year lines + circle
//    • 4 × StatCard: circle(32) + count + label
//    • "X Records" label
//    • 5 × DayCard: dateBlock(44×48) + 3 lines + status pill + chevron
//

export const AttendanceSkeleton = memo(function AttendanceSkeleton() {
  const anim = useShimmerAnim();

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={attStyles.root}>
      <ScrollView
        contentContainerStyle={attStyles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={attStyles.header}>
          <SBone w={140} h={26} r={6} anim={anim} />
          <View style={attStyles.headerActions}>
            <SBone w={104} h={30} pill anim={anim} />
            <SBone w={112} h={30} pill anim={anim} />
          </View>
        </View>

        {/* ── Month Navigator ────────────────────────────────────────── */}
        <View style={attStyles.monthNav}>
          <SBone w={36} h={36} circle anim={anim} />
          <View style={attStyles.monthCenter}>
            <SBone w={100} h={16} r={5} anim={anim} />
            <SBone w={40} h={11} r={4} anim={anim} />
          </View>
          <SBone w={36} h={36} circle anim={anim} />
        </View>

        {/* ── 4 StatCards ────────────────────────────────────────────── */}
        <View style={attStyles.statsRow}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={attStyles.statCard}>
              <SBone w={32} h={32} circle anim={anim} />
              <SBone w={28} h={18} r={4} anim={anim} />
              <SBone w={36} h={10} r={3} anim={anim} />
            </View>
          ))}
        </View>

        {/* ── Records label ──────────────────────────────────────────── */}
        <SBone w={80} h={12} r={4} anim={anim} style={attStyles.recordsLabel} />

        {/* ── DayCards ───────────────────────────────────────────────── */}
        {DAY_CARD_KEYS.map(i => (
          <View key={i} style={attStyles.dayCard}>
            {/* Date block */}
            <SBone w={44} h={48} r={10} anim={anim} />
            {/* Center info lines */}
            <View style={attStyles.dayCardCenter}>
              <SBone w="60%" h={13} r={4} anim={anim} />
              <SBone w="40%" h={11} r={4} anim={anim} />
              <SBone w="30%" h={11} r={4} anim={anim} />
            </View>
            {/* Right col: status pill + chevron */}
            <View style={attStyles.dayCardRight}>
              <SBone w={72} h={24} pill anim={anim} />
              <SBone w={18} h={18} r={4} anim={anim} />
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
});

const DAY_CARD_KEYS = [0, 1, 2, 3, 4];

const attStyles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  // Header: exact match to attendance.tsx styles.header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  // MonthNavigator: exact match to MonthNavigator component container
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  monthCenter: {
    alignItems: 'center',
    gap: 4,
  },
  // 4 StatCards: exact match to attendance.tsx styles.statsRow + StatCard
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 4,
  },
  recordsLabel: {
    marginBottom: 10,
  },
  // DayCard: exact match to DayCard component outer container
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: BONE_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
    marginBottom: 6,
  },
  dayCardCenter: {
    flex: 1,
    gap: 5,
  },
  dayCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
});

// ─── ExpenseSkeleton ──────────────────────────────────────────────────────────
//
//  Layout mirrors expense.tsx:
//    • Header: title(100×24) + subtitle(80×12) | share-report pill + add pill
//    • MonthNavigator: circle + month/year lines + circle
//    • 4 × StatCard: circle(32) + count + label
//    • Filter bar: search input(flex) + date-range pill(112×44)
//    • "X Records" label
//    • 5 × ExpenseCard: dateBlock(44×48) + 3 lines + amount + chevron
//

export const ExpenseSkeleton = memo(function ExpenseSkeleton() {
  const anim = useShimmerAnim();

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={expStyles.root}>
      <ScrollView
        contentContainerStyle={expStyles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={expStyles.header}>
          <View style={expStyles.headerLeft}>
            <SBone w={100} h={24} r={6} anim={anim} />
            <SBone w={80} h={12} r={4} anim={anim} />
          </View>
          <View style={expStyles.headerRight}>
            <SBone w={104} h={30} pill anim={anim} />
            <SBone w={60} h={30} pill anim={anim} />
          </View>
        </View>

        {/* ── Month Navigator ────────────────────────────────────────── */}
        <View style={expStyles.monthNav}>
          <SBone w={36} h={36} circle anim={anim} />
          <View style={expStyles.monthCenter}>
            <SBone w={100} h={16} r={5} anim={anim} />
            <SBone w={40} h={11} r={4} anim={anim} />
          </View>
          <SBone w={36} h={36} circle anim={anim} />
        </View>

        {/* ── 4 StatCards ────────────────────────────────────────────── */}
        <View style={expStyles.statsRow}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={expStyles.statCard}>
              <SBone w={32} h={32} circle anim={anim} />
              <SBone w={28} h={18} r={4} anim={anim} />
              <SBone w={36} h={10} r={3} anim={anim} />
            </View>
          ))}
        </View>

        {/* ── Filter bar: search + date-range pill ───────────────────── */}
        <View style={expStyles.filterRow}>
          <SBone w="100%" h={44} r={10} anim={anim} style={{ flex: 1 }} />
          <SBone w={112} h={44} pill anim={anim} />
        </View>

        {/* ── Records label ──────────────────────────────────────────── */}
        <SBone w={80} h={12} r={4} anim={anim} style={expStyles.recordsLabel} />

        {/* ── ExpenseCards ───────────────────────────────────────────── */}
        {EXPENSE_CARD_KEYS.map(i => (
          <View key={i} style={expStyles.expCard}>
            {/* Date block */}
            <SBone w={44} h={48} r={12} anim={anim} />
            {/* Center info */}
            <View style={expStyles.expCardCenter}>
              <SBone w="55%" h={12} r={4} anim={anim} />
              <SBone w="40%" h={13} r={4} anim={anim} />
              {/* employee name with icon */}
              <View style={expStyles.expIconRow}>
                <SBone w={12} h={12} circle anim={anim} />
                <SBone w="30%" h={11} r={4} anim={anim} style={{ flex: 1 }} />
              </View>
            </View>
            {/* Right col: amount + chevron */}
            <View style={expStyles.expCardRight}>
              <SBone w={64} h={15} r={4} anim={anim} />
              <SBone w={20} h={20} r={4} anim={anim} />
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
});

const EXPENSE_CARD_KEYS = [0, 1, 2, 3, 4];

const expStyles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  // Header: exact match to expense.tsx styles.header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    gap: 5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  // MonthNavigator: same as attendance
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  monthCenter: {
    alignItems: 'center',
    gap: 4,
  },
  // 4 StatCards: exact match to expense.tsx styles.statsRow
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 4,
  },
  // Filter bar: exact match to ExpenseFilter component container
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  recordsLabel: {
    marginBottom: 10,
  },
  // ExpenseCard: exact match to ExpenseCard component outer container
  expCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: BONE_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    marginBottom: 10,
  },
  expCardCenter: {
    flex: 1,
    gap: 4,
  },
  expIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  expCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
});

// ─── DashboardSkeleton ────────────────────────────────────────────────────────
//
//  Mirrors index.tsx (CompanyDashboard) layout exactly:
//    • MonthNavigator      — circle + month/year stacked lines + circle (borderRadius:16)
//    • 2×2 StatCard grid   — 4 bone cards (_DASH_CARD_W each), iconWrap(34×34,r:10) +
//                            value line + label line (borderRadius:18)
//    • Summary Strip       — white bar (r:14) with 3 slots: dot+label+value | sep | ...
//    • Section header      — "Expense Breakdown" title (h:18) + subtitle (h:11)
//    • Chart card (r:18)   — bar chart area (220px: y-axis col + 6 bars) +
//                            divider + 4 expense list rows (dot + name/bar/pct)
//

// Static arrays keep renders pure — no inline allocation on each frame
const DASH_BAR_HEIGHTS = [0.75, 0.45, 0.9, 0.55, 0.35, 0.65] as const;
const EXP_NAME_WIDTHS: ReadonlyArray<number> = [90, 70, 110, 80];

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  const anim = useShimmerAnim();

  return (
    <View style={dashStyles.root}>
      <ScrollView
        contentContainerStyle={dashStyles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── MonthNavigator ─────────────────────────────────── */}
        <View style={dashStyles.monthNav}>
          <SBone w={36} h={36} circle anim={anim} />
          <View style={dashStyles.monthCenter}>
            <SBone w={110} h={17} r={5} anim={anim} />
            <SBone w={44} h={11} r={4} anim={anim} />
          </View>
          <SBone w={36} h={36} circle anim={anim} />
        </View>

        {/* ── 2×2 StatCard grid ──────────────────────────────── */}
        <View style={dashStyles.cardsGrid}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={dashStyles.statCard}>
              {/* icon wrap 34×34 r:10 — matches cardIconWrap */}
              <SBone w={34} h={34} r={10} anim={anim} style={dashStyles.statIconMargin} />
              {/* value — matches cardValue fontSize:16 */}
              <SBone w="65%" h={16} r={5} anim={anim} />
              {/* label — matches cardLabel fontSize:11 */}
              <SBone w="80%" h={11} r={4} anim={anim} />
            </View>
          ))}
        </View>

        {/* ── Summary Strip ──────────────────────────────────── */}
        <View style={dashStyles.summaryStrip}>
          {[0, 1, 2].map(i => (
            <React.Fragment key={i}>
              <View style={dashStyles.stripSlot}>
                {/* colour dot 7×7 — matches stripDot */}
                <SBone w={7} h={7} circle anim={anim} />
                {/* label "Paid" / "Pending" / "Types" */}
                <SBone w={30} h={11} r={4} anim={anim} />
                {/* value "%X" / count */}
                <SBone w={38} h={13} r={4} anim={anim} />
              </View>
              {i < 2 && <View style={dashStyles.stripSep} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Section header ─────────────────────────────────── */}
        <View style={dashStyles.sectionHeader}>
          {/* "Expense Breakdown" — fontSize:17 fontWeight:800 */}
          <SBone w={160} h={18} r={5} anim={anim} />
          {/* "Monthly amount by category" — fontSize:11 */}
          <SBone w={100} h={11} r={4} anim={anim} />
        </View>

        {/* ── Chart card ─────────────────────────────────────── */}
        <View style={dashStyles.chartCard}>
          {/* Bar chart: 220px total — matches chartStyles.container height */}
          <View style={dashStyles.barChartArea}>
            {/* Y-axis ticks: 5 labels — matches yLabel width:65 */}
            <View style={dashStyles.yAxisCol}>
              {[0, 1, 2, 3, 4].map(i => (
                <SBone key={i} w={44} h={9} r={3} anim={anim} />
              ))}
            </View>
            {/* Bar columns — matches barWrapper width:55, bar width:24 */}
            <View style={dashStyles.barsRow}>
              {DASH_BAR_HEIGHTS.map((pct, i) => (
                <View key={i} style={dashStyles.barCol}>
                  <SBone w={24} h={Math.round(120 * pct)} r={5} anim={anim} />
                  {/* category label — matches barLabel fontSize:10 */}
                  <SBone w={38} h={9} r={3} anim={anim} style={dashStyles.barLabelMargin} />
                </View>
              ))}
            </View>
          </View>

          {/* Divider — matches styles.divider */}
          <View style={dashStyles.chartDivider} />

          {/* Expense list items — matches listStyles.item */}
          {EXP_NAME_WIDTHS.map((nameW, i) => (
            <View key={i} style={dashStyles.expRow}>
              {/* colour dot 9×9 — matches listStyles.dot marginTop:4 */}
              <SBone w={9} h={9} circle anim={anim} style={dashStyles.expDotMargin} />
              <View style={dashStyles.expContent}>
                {/* name + amount row */}
                <View style={dashStyles.expTopRow}>
                  <SBone w={nameW} h={12} r={4} anim={anim} />
                  <SBone w={52} h={12} r={4} anim={anim} />
                </View>
                {/* progress bar track — height:4 */}
                <SBone w="100%" h={4} r={4} anim={anim} style={dashStyles.expBarMargin} />
                {/* pct label — fontSize:10 */}
                <SBone w={28} h={10} r={3} anim={anim} style={dashStyles.expPctMargin} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

// ─── EmployeeAttendanceSkeleton ───────────────────────────────────────────────
//
//  Layout mirrors app/(employee)/(tabs)/attendance.tsx:
//    • Header: title(160×22) | date-range trigger(120×32)
//    • MonthNavigator: circle + month/year lines + circle
//    • 4 × StatCard: circle(32) + count + label
//    • Records label
//    • 5 × DayCard: dateBlock(44×48) + month/year line + punch count line | statusBadge(72×24) + chevron(18×18)
//

export const EmployeeAttendanceSkeleton = memo(function EmployeeAttendanceSkeleton() {
  const anim = useShimmerAnim();

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={empAttStyles.root}>
      <ScrollView
        contentContainerStyle={empAttStyles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={empAttStyles.header}>
          <SBone w={160} h={22} r={6} anim={anim} />
          <SBone w={120} h={32} pill anim={anim} />
        </View>

        {/* ── Month Navigator ────────────────────────────────────────── */}
        <View style={empAttStyles.monthNav}>
          <SBone w={36} h={36} circle anim={anim} />
          <View style={empAttStyles.monthCenter}>
            <SBone w={100} h={16} r={5} anim={anim} />
            <SBone w={40} h={11} r={4} anim={anim} />
          </View>
          <SBone w={36} h={36} circle anim={anim} />
        </View>

        {/* ── 4 StatCards ────────────────────────────────────────────── */}
        <View style={empAttStyles.statsRow}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={empAttStyles.statCard}>
              <SBone w={32} h={32} circle anim={anim} />
              <SBone w={28} h={18} r={4} anim={anim} />
              <SBone w={36} h={10} r={3} anim={anim} />
            </View>
          ))}
        </View>

        {/* ── Records label ──────────────────────────────────────────── */}
        <SBone w={80} h={12} r={4} anim={anim} style={empAttStyles.recordsLabel} />

        {/* ── DayCards ───────────────────────────────────────────────── */}
        {EMPLOYEE_DAY_CARD_KEYS.map(i => (
          <View key={i} style={empAttStyles.dayCard}>
            {/* Date block */}
            <SBone w={44} h={48} r={6} anim={anim} />
            {/* Center info lines */}
            <View style={empAttStyles.dayCardCenter}>
              <SBone w={80} h={13} r={4} anim={anim} />
              <SBone w={60} h={11} r={4} anim={anim} />
            </View>
            {/* Right col: status badge + chevron */}
            <View style={empAttStyles.dayCardRight}>
              <SBone w={72} h={24} pill anim={anim} />
              <SBone w={18} h={18} r={4} anim={anim} />
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
});

const EMPLOYEE_DAY_CARD_KEYS = [0, 1, 2, 3, 4];

const empAttStyles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  monthCenter: {
    alignItems: 'center',
    gap: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 4,
  },
  recordsLabel: {
    marginBottom: 10,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: BONE_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  dayCardCenter: {
    flex: 1,
    gap: 4,
  },
  dayCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
});

// ─── EmployeeExpenseSkeleton ──────────────────────────────────────────────────
//
//  Layout mirrors app/(employee)/(tabs)/expense.tsx:
//    • Header: title(120×24) + subtitle(100×12) | add button(42×42, r:14)
//    • MonthNavigator: circle + month/year lines + circle
//    • 4 × StatCard: circle(32) + count + label
//    • Filter bar: search input(flex) + date-range button(90×34)
//    • Records label
//    • 5 × ExpenseCard: dateBlock(42×46) + title + description | amount + status badge
//

export const EmployeeExpenseSkeleton = memo(function EmployeeExpenseSkeleton() {
  const anim = useShimmerAnim();

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={empExpStyles.root}>
      <ScrollView
        contentContainerStyle={empExpStyles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={empExpStyles.header}>
          <View style={empExpStyles.headerLeft}>
            <SBone w={120} h={24} r={6} anim={anim} />
            <SBone w={100} h={12} r={4} anim={anim} />
          </View>
          <SBone w={42} h={42} r={14} anim={anim} />
        </View>

        {/* ── Month Navigator ────────────────────────────────────────── */}
        <View style={empExpStyles.monthNav}>
          <SBone w={36} h={36} circle anim={anim} />
          <View style={empExpStyles.monthCenter}>
            <SBone w={100} h={16} r={5} anim={anim} />
            <SBone w={40} h={11} r={4} anim={anim} />
          </View>
          <SBone w={36} h={36} circle anim={anim} />
        </View>

        {/* ── 4 StatCards ────────────────────────────────────────────── */}
        <View style={empExpStyles.statsRow}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={empExpStyles.statCard}>
              <SBone w={32} h={32} circle anim={anim} />
              <SBone w={28} h={18} r={4} anim={anim} />
              <SBone w={36} h={10} r={3} anim={anim} />
            </View>
          ))}
        </View>

        {/* ── Filter bar: search + date-range button ─────────────────── */}
        <View style={empExpStyles.filterRow}>
          <SBone w="100%" h={34} r={8} anim={anim} style={{ flex: 1 }} />
          <SBone w={90} h={34} r={8} anim={anim} />
        </View>

        {/* ── Records label ──────────────────────────────────────────── */}
        <SBone w={80} h={12} r={4} anim={anim} style={empExpStyles.recordsLabel} />

        {/* ── ExpenseCards ───────────────────────────────────────────── */}
        {EMPLOYEE_EXPENSE_CARD_KEYS.map(i => (
          <View key={i} style={empExpStyles.expCard}>
            {/* Date block */}
            <SBone w={42} h={46} r={6} anim={anim} />
            {/* Center info */}
            <View style={empExpStyles.expCardCenter}>
              <SBone w={110} h={13} r={4} anim={anim} />
              <SBone w={70} h={11} r={4} anim={anim} />
            </View>
            {/* Right col: amount + status badge */}
            <View style={empExpStyles.expCardRight}>
              <SBone w={56} h={15} r={4} anim={anim} />
              <SBone w={65} h={18} pill anim={anim} />
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
});

const EMPLOYEE_EXPENSE_CARD_KEYS = [0, 1, 2, 3, 4];

const empExpStyles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    gap: 5,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  monthCenter: {
    alignItems: 'center',
    gap: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  recordsLabel: {
    marginBottom: 10,
  },
  expCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderLeftWidth: 4,
    borderLeftColor: BONE_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    marginBottom: 10,
  },
  expCardCenter: {
    flex: 1,
    gap: 4,
  },
  expCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
});

const dashStyles = StyleSheet.create({
  // Root — matches styles.container backgroundColor:'#f8fafc'
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Scroll — matches styles.body (px:20, pt:16, pb:60)
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  // MonthNavigator — exact match to MonthNavigator component container
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  monthCenter: {
    alignItems: 'center',
    gap: 4,
  },
  // 2×2 grid — matches styles.cardsGrid
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  // Each card — same width / borderRadius / padding as styles.statCard
  statCard: {
    width: _DASH_CARD_W,
    borderRadius: 18,
    backgroundColor: BONE_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 6,
    overflow: 'hidden',
  },
  statIconMargin: {
    marginBottom: 4,
  },
  // Summary strip — exact match to styles.summaryStrip
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#eef0f4',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stripSlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  // Separator — matches styles.stripSep
  stripSep: {
    width: 1,
    height: 18,
    backgroundColor: '#e9ecf0',
  },
  // Section header — matches styles.sectionHeader area (marginBottom:12)
  sectionHeader: {
    gap: 4,
    marginBottom: 12,
    marginTop: 2,
  },
  // Chart card — exact match to styles.chartCard
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f2f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  // Chart area — height 220 matches chartStyles.container
  barChartArea: {
    height: 220,
    flexDirection: 'row',
    gap: 4,
  },
  // Y-axis — mirrors yLabel column (width:65 in real chart)
  yAxisCol: {
    width: 52,
    height: '100%',
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 4,
  },
  // Bars area — mirrors barsContainer paddingLeft:70 alignItems:'flex-end'
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 22,
  },
  barCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barLabelMargin: {
    marginTop: 6,
  },
  // Divider — exact match to styles.divider (marginVertical:16)
  chartDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  // Expense row — exact match to listStyles.item
  expRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  expDotMargin: {
    marginTop: 4,
  },
  expContent: {
    flex: 1,
  },
  expTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expBarMargin: {
    marginTop: 5,
  },
  expPctMargin: {
    marginTop: 3,
  },
});

// ─── CustomersSkeleton ───────────────────────────────────────────────────────

export const CustomersSkeleton = memo(function CustomersSkeleton() {
  const anim = useShimmerAnim();

  return (
    <View style={custSkStyles.root}>
      <ScrollView
        contentContainerStyle={custSkStyles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* Search + filter row */}
        <View style={custSkStyles.searchRow}>
          <View style={custSkStyles.searchBar}>
            <SBone w={18} h={18} circle anim={anim} />
            <SBone w="70%" h={14} r={4} anim={anim} style={{ flex: 1 }} />
          </View>
          <SBone w={44} h={46} r={8} anim={anim} />
        </View>

        {/* Records label */}
        <SBone w={90} h={12} r={4} anim={anim} style={custSkStyles.recordsLabel} />

        {/* Customer cards */}
        {CUST_CARD_KEYS.map(i => (
          <View key={i} style={custSkStyles.card}>
            {/* Top: avatar + name + id badge */}
            <View style={custSkStyles.cardTop}>
              <SBone w={52} h={52} circle anim={anim} />
              <View style={custSkStyles.nameBlock}>
                <SBone w="55%" h={16} r={4} anim={anim} />
                <SBone w={80} h={22} r={6} anim={anim} />
              </View>
            </View>

            <View style={custSkStyles.divider} />

            {/* Contact row */}
            <View style={custSkStyles.fieldRow}>
              <View style={custSkStyles.field}>
                <SBone w={40} h={10} r={3} anim={anim} />
                <SBone w="80%" h={13} r={4} anim={anim} />
              </View>
              <View style={custSkStyles.field}>
                <SBone w={60} h={10} r={3} anim={anim} />
                <SBone w="80%" h={13} r={4} anim={anim} />
              </View>
            </View>

            {/* Email row */}
            <View style={custSkStyles.fieldRow}>
              <View style={custSkStyles.field}>
                <SBone w={30} h={10} r={3} anim={anim} />
                <SBone w="90%" h={13} r={4} anim={anim} />
              </View>
            </View>

            <View style={custSkStyles.divider} />

            {/* Address row */}
            <View style={custSkStyles.fieldRow}>
              <View style={custSkStyles.field}>
                <SBone w={50} h={10} r={3} anim={anim} />
                <SBone w="85%" h={13} r={4} anim={anim} />
              </View>
              <View style={custSkStyles.field}>
                <SBone w={40} h={10} r={3} anim={anim} />
                <SBone w="70%" h={13} r={4} anim={anim} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const CUST_CARD_KEYS = [0, 1, 2, 3, 4, 5];

const custSkStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5FB', marginTop: 10 },
  scroll: { paddingHorizontal: 14, paddingBottom: 100 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: CARD_BORDER,
    borderRadius: 8, paddingHorizontal: 14, height: 46,
  },
  recordsLabel: { marginBottom: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1,
    borderColor: '#e5e6e7', padding: 14, marginBottom: 8, gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameBlock: { flex: 1, gap: 6 },
  divider: { height: 1, backgroundColor: DIVIDER_COLOR },
  fieldRow: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, gap: 4 },
});

// ─── Generic styles ───────────────────────────────────────────────────────────

const genericStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F3F6',
  },
});