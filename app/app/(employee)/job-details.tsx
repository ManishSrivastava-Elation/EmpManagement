import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TouchableOpacity, View, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';

import {
  JobDetailsCard,
  CustomerDetailsCard,
  EmployeeDetailsCard,
  BG,
} from '@/components/employees/job';
import { getEmployeeJobDetails, type JobDetailsData } from '@/services/employees/job.service';
import { theme } from '@/theme';

import { checkIn, checkOut, getTodayAttendance } from '@/services/employees/attendance.service';
import { getCurrentLocation, type LocationData } from '@/utils/locationHelpers';
import { getUTCISOString } from '@/utils/timeHelpers';
import CameraModal from '@/components/employees/attendance/CameraModal';
import LoadingOverlay from '@/components/employees/attendance/LoadingOverlay';
import PrimaryButton from '@/components/common/PrimaryButton';
import { JobDetailsSkeleton } from '@/components/employee/skeleton';

const { colors, fontSize, fontWeight, radius } = theme;

export default function EmployeeJobDetailsScreen() {
  const { job_id } = useLocalSearchParams<{ job_id: string }>();
  const navigation = useNavigation();
  const jobId = Number(job_id);

  const [data, setData] = useState<JobDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Attendance Camera & GPS state
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeAttendanceId, setActiveAttendanceId] = useState<number | null>(null);

  // Temporary storage for flow data
  const locationPromise = useRef<Promise<LocationData> | null>(null);
  const locationResult = useRef<LocationData | null>(null);
  const punchType = useRef<'in' | 'out'>('in');

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEmployeeJobDetails(jobId);
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const checkActiveAttendance = useCallback(async () => {
    try {
      const todayRes = await getTodayAttendance();
      if (todayRes?.data && todayRes.success) {
        const activeRecord = todayRes.data.find((rec: any) => !rec.CheckOutTime || rec.CheckOutTime === null);
        if (activeRecord) {
          setActiveAttendanceId(Number(activeRecord.AttendanceId));
        }
      }
    } catch (err) {
      console.log('Failed to fetch active attendance:', err);
    }
  }, []);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  useEffect(() => {
    if (data?.job?.status === 'IN_PROGRESS') {
      checkActiveAttendance();
    }
  }, [data?.job?.status, checkActiveAttendance]);

  useEffect(() => {
    navigation.setOptions({ title: data?.job?.job_title || 'Job Details' });
  }, [navigation, data?.job?.job_title]);

  // Construct complete customer address string
  const siteAddress = data
    ? [
        data.customer.address_line1,
        data.customer.address_line2,
        data.customer.city,
        data.customer.state,
        data.customer.pincode,
      ]
        .map((part) => part?.trim())
        .filter((part) => !!part)
        .join(', ')
    : '';

  const handlePunch = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to punch in or out.',
        );
        return;
      }
    }

    punchType.current = data?.job?.status === 'IN_PROGRESS' ? 'out' : 'in';
    locationResult.current = null;
    locationPromise.current = getCurrentLocation(); // Start background GPS fetch
    setCameraOpen(true);
  };

  const handleCapture = (photoUri: string) => {
    setCameraOpen(false);

    if (punchType.current === 'in') {
      handleCheckInProcess(photoUri);
    } else {
      handleCheckOutProcess(photoUri);
    }
  };

  const handleCheckInProcess = async (photoUri: string) => {
    setProcessing(true);
    setLoadingMessage('Checking in...');

    try {
      const loc = locationResult.current ?? (await locationPromise.current);
      if (!loc) throw new Error('Could not get location');

      const lat = loc.latitude ? loc.latitude.toString() : '';
      const lng = loc.longitude ? loc.longitude.toString() : '';

      const getNormalizedUri = (uri: string) => {
        if (Platform.OS === 'android' && !uri.startsWith('file://')) {
          return `file://${uri}`;
        }
        return uri;
      };

      const payload: any = {
        CheckInTime: getUTCISOString(),
        CheckInLatitude: lat,
        CheckInLongitude: lng,
        IsWithinGeoFence: true,
        DynamicAddress: loc.address || siteAddress,
        LocationSource: 'GPS',
        AccuracyMeters: loc.accuracy ? Math.round(loc.accuracy) : 5,
        ImageTimestamp: getUTCISOString(),
        DeviceInfo: `${Device.deviceName || 'Unknown'} | ${Device.modelName || Device.modelId || 'Unknown'}`,
        LocalId: `${Date.now()}`,
        Address: siteAddress,
        job_id: jobId,
      };

      if (photoUri) {
        payload.checkInImage = {
          uri: getNormalizedUri(photoUri),
          name: `checkin-${Date.now()}.jpg`,
          type: 'image/jpeg',
        };
      }

      const response = await checkIn(payload);
      const attendanceId =
        response?.AttendanceId ??
        response?.attendanceId ??
        response?.data?.AttendanceId ??
        response?.data?.attendanceId ??
        null;

      if (attendanceId) {
        setActiveAttendanceId(Number(attendanceId));
      }

      Alert.alert(
        'Success',
        'Checked in successfully!',
      );

      // Refresh job details status
      await fetchDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to check in');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOutProcess = async (photoUri?: string) => {
    setProcessing(true);
    setLoadingMessage('Fetching GPS and checking out...');

    try {
      const loc = await locationPromise.current;
      if (!loc) throw new Error('Could not get location');

      const lat = loc.latitude ? loc.latitude.toString() : '';
      const lng = loc.longitude ? loc.longitude.toString() : '';

      let attendanceId = activeAttendanceId;
      if (!attendanceId) {
        const todayRes = await getTodayAttendance();
        if (todayRes?.data && todayRes.success) {
          const activeRecord = todayRes.data.find((rec: any) => !rec.CheckOutTime || rec.CheckOutTime === null);
          if (activeRecord) {
            attendanceId = Number(activeRecord.AttendanceId);
          }
        }
      }

      if (!attendanceId) {
        throw new Error(
          'Unable to find active attendance record for checkout.',
        );
      }

      const getNormalizedUri = (uri: string) => {
        if (Platform.OS === 'android' && !uri.startsWith('file://')) {
          return `file://${uri}`;
        }
        return uri;
      };

      const payload: any = {
        CheckOutTime: getUTCISOString(),
        CheckOutLatitude: lat,
        CheckOutLongitude: lng,
        IsWithinGeoFence: true,
        DynamicAddress: loc.address || siteAddress,
        LocationSource: 'GPS',
        AccuracyMeters: loc.accuracy ? Math.round(loc.accuracy) : 5,
        ImageTimestamp: getUTCISOString(),
        DeviceInfo: `${Device.deviceName || 'Unknown'} | ${Device.modelName || Device.modelId || 'Unknown'}`,
        Address: siteAddress,
        FaceVerified: true,
        job_id: jobId,
      };

      if (photoUri) {
        payload.checkOutImage = {
          uri: getNormalizedUri(photoUri),
          name: `checkout-${Date.now()}.jpg`,
          type: 'image/jpeg',
        };
      }

      await checkOut(attendanceId, payload);

      Alert.alert(
        'Success',
        'Checked out successfully!',
      );

      // Refresh job details status
      await fetchDetails();
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message || err?.response?.data || err?.message;
      Alert.alert('Error', String(serverMessage || 'Failed to check out'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <JobDetailsSkeleton />;
  }

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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <JobDetailsCard job={data.job} />
        <CustomerDetailsCard customer={data.customer} />
        {data.employee && <EmployeeDetailsCard employee={data.employee} />}
        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.footerContainer}>
        {data.job.status === 'COMPLETED' ? (
          <PrimaryButton
            label="Work Completed"
            onPress={() => {}}
            disabled={true}
          />
        ) : (
          <PrimaryButton
            label={data.job.status === 'IN_PROGRESS' ? 'End Work' : 'Start Work'}
            onPress={handlePunch}
          />
        )}
      </View>

      <LoadingOverlay visible={processing} message={loadingMessage} />
      <CameraModal
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapture}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 14 },
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
  footerContainer: {
    padding: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});
