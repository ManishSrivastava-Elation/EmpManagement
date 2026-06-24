import LoadingOverlay from '@/components/common/LoadingOverlay';
import MonthNavigator from '@/components/common/MonthNavigator';
import { theme } from '@/theme';
import { getCompanyDashboardStats, getCompanyExpenseByType } from '@/services/company/dashboard.service';
import { getUser } from '@/services/storage.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2;

const CHART_COLORS = [
  '#2563EB', '#F59E0B', '#16A34A', '#DC2626', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

interface DashboardStats {
  totalEmployees: number;
  totalExpense: number;
  totalWithdrawal: number;
  pendingWithdrawal: number;
}

interface ExpenseTypeData {
  name: string;
  amount: number;
  count: number;
}

const formatRawCurrency = (val: number): string => {
  if (isNaN(val)) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
};

// ── ✅ Responsive Custom Bar Chart (using Views) ──
function BarChart({ data }: { data: { name: string; amount: number; color: string }[] }) {
  const chartHeight = 180;
  if (data.length === 0) return null;

  const maxAmount = Math.max(...data.map(d => d.amount), 0.01);

  return (
    <View style={chartStyles.container}>
      {/* Grid Y-Ticks & Horizontal Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
        const bottomOffset = tick * chartHeight;
        const value = maxAmount * tick;
        return (
          <View key={i} style={[chartStyles.gridLineRow, { bottom: bottomOffset + 30 }]}>
            <Text style={chartStyles.yLabel}>{formatRawCurrency(value)}</Text>
            <View style={chartStyles.line} />
          </View>
        );
      })}

      {/* Scrollable Bars */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          chartStyles.barsContainer,
          { height: chartHeight + 35 }
        ]}
      >
        {data.map((item, idx) => {
          const barHeight = (item.amount / maxAmount) * (chartHeight - 10);
          return (
            <View key={idx} style={chartStyles.barWrapper}>
              <View style={chartStyles.barCol}>
                <View
                  style={[
                    chartStyles.bar,
                    {
                      height: Math.max(barHeight, 6),
                      backgroundColor: item.color,
                    }
                  ]}
                />
              </View>
              <Text numberOfLines={1} style={chartStyles.barLabel}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    height: 220,
    position: 'relative',
    marginTop: 10,
    marginBottom: 10,
  },
  gridLineRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  yLabel: {
    width: 65,
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'right',
    paddingRight: 6,
    fontWeight: '600',
  },
  line: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 1,
  },
  barsContainer: {
    paddingLeft: 70,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  barsContainerInside: {
    alignItems: 'flex-end',
    gap: 16,
  },
  barWrapper: {
    alignItems: 'center',
    width: 55,
  },
  barCol: {
    height: '100%',
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
    paddingBottom: 22,
  },
  bar: {
    width: 24,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  barLabel: {
    position: 'absolute',
    bottom: 2,
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    width: 55,
    textAlign: 'center',
  },
});

// ── Full-Gradient Stat Card ─────────────────────────
function StatCard({ icon, label, value, gradient }: {
  icon: string; label: string; value: string; gradient: [string, string, string];
}) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statCard}
    >
      <View style={styles.cardCircle} />
      <View style={styles.cardCircle2} />
      <View style={styles.cardIconRow}>
        <View style={styles.cardIconWrap}>
          <MaterialCommunityIcons name={icon as any} size={18} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      <Text style={styles.cardValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </LinearGradient>
  );
}

// ── Expense List Item (bar + percentage) ──
function ExpenseItem({ name, amount, total, color }: {
  name: string; amount: number; total: number; color: string;
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  const barWidth = `${Math.max(pct, 2)}%`;

  return (
    <View style={listStyles.item}>
      <View style={[listStyles.dot, { backgroundColor: color }]} />
      <View style={listStyles.content}>
        <View style={listStyles.row}>
          <Text style={listStyles.name} numberOfLines={1}>{name}</Text>
          <Text style={listStyles.amount}>{formatRawCurrency(amount)}</Text>
        </View>
        <View style={listStyles.barTrack}>
          <View style={[listStyles.barFill, { width: barWidth as any, backgroundColor: color }]} />
        </View>
        <Text style={listStyles.pct}>{pct.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

const listStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 4 },
  content: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  name: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, flex: 1, marginRight: 8 },
  amount: { fontSize: 12, fontWeight: '800', color: theme.colors.text },
  barTrack: { height: 4, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 4 },
  pct: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 3, fontWeight: '600' },
});

// ── Main Dashboard ──────────────────────────────────
export default function CompanyDashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [companyName, setCompanyName] = useState('Company');
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0, totalExpense: 0, totalWithdrawal: 0, pendingWithdrawal: 0,
  });
  const [expenseByType, setExpenseByType] = useState<ExpenseTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;


  const fetchData = useCallback(async () => {
    try {
      const apiMonth = month + 1;
      const [statsRes, chartRes] = await Promise.all([
        getCompanyDashboardStats(apiMonth, year),
        getCompanyExpenseByType(apiMonth, year),
      ]);
      if (statsRes.success) {
        const d = statsRes.data;
        setStats({
          totalEmployees: Number(d.totalEmployees) || 0,
          totalExpense: parseFloat(d.totalExpense) || 0,
          totalWithdrawal: parseFloat(d.totalWithdrawal) || 0,
          pendingWithdrawal: parseFloat(d.pendingWithdrawal) || 0,
        });
      }
      if (chartRes.success) setExpenseByType(chartRes.data);

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    } catch (err) {
      console.error('Company Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const handlePrev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const handleNext = () => {
    const n = new Date();
    if (month === n.getMonth() && year === n.getFullYear()) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const CARDS = [
    {
      label: 'Employees',
      value: stats.totalEmployees.toString(),
      icon: 'account-group-outline',
      gradient: ['#2563EB', '#3b82f6', '#1d4ed8'] as [string, string, string],
    },
    {
      label: 'Total Expense',
      value: formatRawCurrency(stats.totalExpense),
      icon: 'wallet-outline',
      gradient: ['#F59E0B', '#f59e0b', '#d97706'] as [string, string, string],
    },
    {
      label: 'Paid / Withdrawal',
      value: formatRawCurrency(stats.totalWithdrawal),
      icon: 'bank-transfer-out',
      gradient: ['#16A34A', '#16a34a', '#15803d'] as [string, string, string],
    },
    {
      label: 'Pending',
      value: formatRawCurrency(stats.pendingWithdrawal),
      icon: 'timer-sand',
      gradient: ['#DC2626', '#dc2626', '#b91c1c'] as [string, string, string],
    },
  ];

  const chartData = expenseByType.map((item, i) => ({
    name: item.name,
    amount: Number(item.amount),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const totalAmount = chartData.reduce((s, d) => s + d.amount, 0);
  const paidPct = stats.totalExpense > 0 ? ((stats.totalWithdrawal / stats.totalExpense) * 100).toFixed(1) : '0';
  const pendPct = stats.totalExpense > 0 ? ((stats.pendingWithdrawal / stats.totalExpense) * 100).toFixed(1) : '0';

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <LoadingOverlay visible={loading} message="Loading dashboard..." />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.body}>
          <MonthNavigator
            month={month} year={year}
            onPrev={handlePrev} onNext={handleNext}
            disableNext={isCurrentMonth}
          />

          {!loading && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Stat Cards */}
              <View style={styles.cardsGrid}>
                {CARDS.map((c, i) => (
                  <StatCard key={i} icon={c.icon} label={c.label} value={c.value} gradient={c.gradient} />
                ))}
              </View>

              {/* Summary Strip */}
              <View style={styles.summaryStrip}>
                <View style={styles.stripItem}>
                  <View style={[styles.stripDot, { backgroundColor: '#16A34A' }]} />
                  <Text style={styles.stripLabel}>Paid </Text>
                  <Text style={styles.stripValue}>{paidPct}%</Text>
                </View>
                <View style={styles.stripSep} />
                <View style={styles.stripItem}>
                  <View style={[styles.stripDot, { backgroundColor: '#DC2626' }]} />
                  <Text style={styles.stripLabel}>Pending </Text>
                  <Text style={styles.stripValue}>{pendPct}%</Text>
                </View>
                <View style={styles.stripSep} />
                <View style={styles.stripItem}>
                  <View style={[styles.stripDot, { backgroundColor: '#2563EB' }]} />
                  <Text style={styles.stripLabel}>Types </Text>
                  <Text style={styles.stripValue}>{expenseByType.length}</Text>
                </View>
              </View>

              {/* Expense Breakdown Section */}
              <View style={styles.chartSection}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Expense Breakdown</Text>
                    <Text style={styles.sectionSub}>Monthly amount by category</Text>
                  </View>
                </View>

                {chartData.length > 0 ? (
                  <View style={styles.chartCard}>
                    {/* ✅ Standard View-based Bar Chart */}
                    <BarChart data={chartData} />

                    <View style={styles.divider} />

                    {/* Detailed list with percentages */}
                    <View style={styles.expenseList}>
                      {chartData.map((item, i) => (
                        <ExpenseItem
                          key={i}
                          name={item.name}
                          amount={item.amount}
                          total={totalAmount}
                          color={item.color}
                        />
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyChart}>
                    <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.emptyInner}>
                      <MaterialCommunityIcons name="chart-areaspline" size={44} color="#cbd5e1" />
                      <Text style={styles.emptyTitle}>No Expenses</Text>
                      <Text style={styles.emptyText}>No expense data for this month</Text>
                    </LinearGradient>
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  companyNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subTitleText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    width: CARD_WIDTH,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  cardCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -20,
    right: -20,
  },
  cardCircle2: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -10,
    left: 10,
  },
  cardIconRow: { marginBottom: 10 },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
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
  stripItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  stripDot: { width: 7, height: 7, borderRadius: 4 },
  stripLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  stripValue: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  stripSep: { width: 1, height: 18, backgroundColor: '#e9ecf0' },
  chartSection: { marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', letterSpacing: -0.3 },
  sectionSub: { fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '500' },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f2f7',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  expenseList: { gap: 0 },
  emptyChart: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eef0f4',
  },
  emptyInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  emptyText: { fontSize: 12, color: '#64748b' },
});
