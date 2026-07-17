import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  JobDetailsCard,
  CustomerDetailsCard,
  EmployeeDetailsCard,
  EmptyAssignment,
  BG,
} from '@/components/company/jobs';
import { AssignJobModal } from '@/components/company/jobs/assign';
import { getJobDetails, type JobDetailsData } from '@/services/company/job.service';
import { theme } from '@/theme';
import { JobDetailsSkeleton } from '@/components/employee/skeleton';

const { colors, spacing, radius, fontSize, fontWeight } = theme;

export default function JobDetailsScreen() {
  const { job_id } = useLocalSearchParams<{ job_id: string }>();
  const navigation = useNavigation();
  const jobId = Number(job_id);

  const [data, setData] = useState<JobDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobDetails(jobId);
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  useEffect(() => {
    navigation.setOptions({ title: data?.job?.job_title || 'Job Details' });
  }, [navigation, data?.job?.job_title]);

  const handleAssignSuccess = useCallback(() => {
    setModalVisible(false);
    fetchDetails();
  }, [fetchDetails]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return <JobDetailsSkeleton />;

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorIconBox}>
          <Ionicons name="cloud-offline-outline" size={48} color="#D1D5DB" />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>{error || 'Job not found.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAssigned = !!data.employee;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <JobDetailsCard job={data.job} />
        <CustomerDetailsCard customer={data.customer} />
        {isAssigned
          ? <EmployeeDetailsCard employee={data.employee!} />
          : <EmptyAssignment />
        }
        {/* bottom padding so content clears the footer */}
        <View style={{ height: 8 }} />
      </ScrollView>

      {/* ── Bottom Actions ─────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        {/* <TouchableOpacity style={styles.editBtn} activeOpacity={0.75}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit Job</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.assignBtnWrap}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={[colors.primary, colors.success]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.assignBtn}
          >
            <Ionicons name="person-add-outline" size={16} color="#fff" />
            <Text style={styles.assignBtnText}>
              {isAssigned ? 'Reassign Job' : 'Assign Job'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <AssignJobModal
        visible={modalVisible}
        jobId={jobId}
        isReassign={isAssigned}
        onClose={() => setModalVisible(false)}
        onSuccess={handleAssignSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 14 },

  // Loading / Error
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: BG, gap: 10, paddingHorizontal: 32,
  },
  errorIconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  errorTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: '#374151' },
  errorSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    marginTop: 4, backgroundColor: '#1B2E6F',
    paddingHorizontal: 28, paddingVertical: 10, borderRadius: radius.sm,
  },
  retryText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.sm },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },
  editBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  assignBtnWrap: { flex: 2 },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },
  assignBtnText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
