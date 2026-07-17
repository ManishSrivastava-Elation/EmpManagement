import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { CompanyProfileSkeleton } from '@/components/employee/skeleton';
import { getCompanyProfile, type CompanyProfile } from '@/services/company/company.service';
import { getCurrentSubscription, type CompanySubscription } from '@/services/company/subscription.service';
import { clearSession } from '@/services/storage.service';
import { baseImageUrl } from '@/api/apis';

export default function CompanyProfileScreen() {
  const router = useRouter();
  const [companyData, setCompanyData] = useState<CompanyProfile | null>(null);
  const [subData, setSubData] = useState<CompanySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, subRes] = await Promise.all([
        getCompanyProfile(),
        getCurrentSubscription(),
      ]);
      setCompanyData(compRes.data);
      setSubData(subRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  }, []);

useFocusEffect(
  useCallback(() => {
    fetchData();
  }, [fetchData])
);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    if (!companyData) return;
    router.push({
      pathname: "/(company)/edit-profile",
      params: { profile: JSON.stringify(companyData) },
    });
  };

  const handleUpdatePassword = () => {
    router.push("/(company)/update-password");
  };

  if (loading) return <CompanyProfileSkeleton />;

  if (error || !companyData) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.textPrimary, marginBottom: 12, fontSize: 16 }}>{error || 'Profile not found'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Company card */}
        <View style={[styles.card, styles.companyCard]}>
          <View style={styles.logoWrap}>
            <Image
              source={{ uri: `${baseImageUrl}${companyData.logo_url}` || 'https://i.imgur.com/8Km9tLL.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyData.company_name}</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>Company ID: {companyData.company_id}</Text>
            </View>
            <View style={[styles.pill, styles.pillSuccess, styles.statusPill]}>
              <Ionicons name="checkmark-circle" size={13} color={colors.successText} />
              <Text style={[styles.pillText, { color: colors.successText }]}>
                {companyData.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Person */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Contact Person</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.contactPersonRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={28} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.contactName}>{companyData.contact_person_name || 'Not Provided'}</Text>
              <Text style={styles.contactDesignation}>
                {companyData.designation || 'Not Provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="call-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Contact Information</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{companyData.email || 'Not Provided'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{companyData.mobile || 'Not Provided'}</Text>
            </View>
          </View>
        </View>

        {/* Active Subscription */}
        <View style={styles.card}>
          <View style={styles.subHeaderRow}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Active Subscription</Text>
            </View>
            <View style={[styles.pill, subData ? styles.pillSuccess : styles.pillWarning]}>
              <Text style={[styles.pillText, { color: subData ? colors.successText : colors.warningText }]}>
                {subData ? subData.status : 'No Subscription'}
              </Text>
            </View>
          </View>

          {subData ? (
            <View style={styles.planBox}>
              <View style={styles.planRow}>
                <View style={styles.planIconBox}>
                  <Ionicons name="ribbon" size={22} color="#FFFFFF" />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{subData.subscriptionName}</Text>
                </View>
                <View style={styles.priceWrap}>
                  <Text style={styles.priceText}>₹{subData.purchasedPrice}</Text>
                </View>
              </View>

              <View style={styles.planDivider} />

              <View style={styles.planFooterRow}>
                <View style={styles.planFooterItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <View>
                    <Text style={styles.footerLabel}>Expires On</Text>
                    <Text style={styles.footerValue}>
                      {subData.expiresAt ? new Date(subData.expiresAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.footerSeparator} />
                <View style={styles.planFooterItem}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <View>
                    <Text style={styles.footerLabel}>Days Remaining</Text>
                    <Text style={styles.footerValue}>
                      {subData.daysLeft} Days
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.planBox}>
              <Text style={styles.planDescription}>
                You do not have an active subscription. Contact admin or purchase a plan to get access.
              </Text>
            </View>
          )}
        </View>

        {/* Quick actions */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="flash-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Quick actions</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={styles.actionLabel}>Edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleUpdatePassword}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
              <Text style={styles.actionLabel}>Update password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.primary} />
              <Text style={styles.actionLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Theme ----
const colors = {
  bg: '#F3F5F9',
  card: '#FFFFFF',
  primary: '#2F5FE0',
  primaryDark: '#1C46C9',
  textPrimary: '#1B1F2A',
  textSecondary: '#6B7280',
  border: '#EEF0F4',
  badgeBg: '#EAF0FE',
  badgeText: '#2F5FE0',
  successBg: '#E5F6EA',
  successText: '#1E8E3E',
  warningBg: '#FFF1DC',
  warningText: '#C97A0E',
  dangerText: '#D6573C',
  iconCircleBg: '#EEF2FB',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 6,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0B1A3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 1,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  logo: {
    width: 56,
    height: 56,
  },
  companyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  idBadge: {
    backgroundColor: colors.badgeBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  idBadgeText: {
    color: colors.badgeText,
    fontSize: 13,
    fontWeight: '600',
  },
  statusPill: {
    alignSelf: 'flex-start',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  contactPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  contactDesignation: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillSuccess: {
    backgroundColor: colors.successBg,
  },
  pillWarning: {
    backgroundColor: colors.warningBg,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planBox: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 14,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  priceCycle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.badgeBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  planDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  planDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  planFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planFooterItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerSeparator: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },
  footerLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  retryBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: colors.primary,
    fontWeight: '600',
  },
});