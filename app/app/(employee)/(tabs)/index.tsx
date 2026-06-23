// app/(employee)/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AttendanceCard from "../../../components/employees/attendance/AttendanceCard";
import CameraModal from "../../../components/employees/attendance/CameraModal";
import LoadingOverlay from "../../../components/employees/attendance/LoadingOverlay";
import SiteModal from "../../../components/employees/attendance/SiteModal";
import TodaySitesCard, {
  SiteVisit,
} from "../../../components/employees/attendance/TodaySitesCard";

import * as Device from "expo-device";
import {
  checkIn,
  CheckInPayload,
  checkOut,
  CheckOutPayload,
} from "../../../services/employees/attendance.service";
import {
  getCurrentLocation,
  LocationData,
} from "../../../utils/locationHelpers";
import {
  getFormattedDate,
  getFormattedTime,
  getGreeting,
  getUTCISOString,
} from "../../../utils/timeHelpers";

const Header = ({ greeting }: { greeting: string }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar} />
          </View>
          <View style={styles.onlineDot} />
        </View>
        <View>
          <Text style={styles.greetingSmall}>{greeting} ✨</Text>
          <Text style={styles.greeting}>
            Hi, <Text style={styles.greetingBold}>User</Text>
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.menuBtn}
        onPress={() => setMenuVisible(!menuVisible)}
      >
        <Ionicons name="chevron-down-outline" size={20} color="#374151" />
      </Pressable>
    </View>
  );
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  // Time & Greeting State
  const [currentTime, setCurrentTime] = useState(getFormattedTime());
  const [currentDate] = useState(getFormattedDate());
  const [greeting, setGreeting] = useState(getGreeting());

  // Static Attendance State
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [workingHrs, setWorkingHrs] = useState("0h 0m");
  const [todaySites, setTodaySites] = useState<SiteVisit[]>([]);
  const [activeAttendanceId, setActiveAttendanceId] = useState<number | null>(
    null,
  );

  // Modals & Process State
  const [cameraOpen, setCameraOpen] = useState(false);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Temporary storage for flow data
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const locationPromise = useRef<Promise<LocationData> | null>(null);
  const locationResult = useRef<LocationData | null>(null);
  const punchType = useRef<"in" | "out">("in");
  const checkInDate = useRef<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getFormattedTime());
      setGreeting(getGreeting());

      // Simple working hours calculation mock
      if (isPunchedIn && checkInDate.current) {
        const diffMs = Date.now() - checkInDate.current.getTime();
        const totalMins = Math.floor(diffMs / 60000);
        setWorkingHrs(`${Math.floor(totalMins / 60)}h ${totalMins % 60}m`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPunchedIn]);

  const handlePunch = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to punch in or out.",
        );
        return;
      }
    }

    punchType.current = isPunchedIn ? "out" : "in";
    locationResult.current = null;
    locationPromise.current = getCurrentLocation(); // Start background GPS fetch
    setCapturedPhoto(null);
    setCameraOpen(true);
  };

  const handleCapture = (photoUri: string) => {
    setCapturedPhoto(photoUri);
    setCameraOpen(false);

    if (punchType.current === "in") {
      setSiteModalOpen(true); // Proceed to site selection for check-in
    } else {
      handleCheckOutProcess(photoUri); // Proceed directly to checkout for check-out
    }
  };

  const handleSiteSubmit = async (site: string) => {
    setSiteModalOpen(false);
    setProcessing(true);
    setLoadingMessage("Checking in...");

    try {
      // Await GPS if not already fetched
      const loc = locationResult.current ?? (await locationPromise.current);
      if (!loc) throw new Error("Could not get location");

      const lat = loc.latitude ? loc.latitude.toString() : "";
      const lng = loc.longitude ? loc.longitude.toString() : "";

      const getNormalizedUri = (uri: string) => {
        if (Platform.OS === "android" && !uri.startsWith("file://")) {
          return `file://${uri}`;
        }
        return uri;
      };

      const payload: CheckInPayload = {
        CheckInTime: getUTCISOString(),
        CheckInLatitude: lat,
        CheckInLongitude: lng,
        IsWithinGeoFence: true, // Defaulting to true as requested
        DynamicAddress: loc.address || site,
        LocationSource: "GPS",
        AccuracyMeters: loc.accuracy ? Math.round(loc.accuracy) : 5,
        ImageTimestamp: getUTCISOString(),
        DeviceInfo: `${Device.deviceName || "Unknown"} | ${Device.modelName || Device.modelId || "Unknown"}`,
        LocalId: `${Date.now()}`,
        Address: site,
      };

      if (capturedPhoto) {
        payload.checkInImage = {
          uri: getNormalizedUri(capturedPhoto),
          name: `checkin-${Date.now()}.jpg`,
          type: "image/jpeg",
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

      // Update static UI state
      const timeStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCheckInTime(timeStr);
      setCheckOutTime(null);
      setIsPunchedIn(true);
      checkInDate.current = new Date();
      setTodaySites((prev) => [
        ...prev,
        {
          site: site,
          checkIn: timeStr,
          attendanceId: attendanceId ? Number(attendanceId) : undefined,
        },
      ]);

      Alert.alert(
        "Success",
        "Checked in successfully! Data logged to console.",
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to check in");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOutProcess = async (photoUri?: string) => {
    setProcessing(true);
    setLoadingMessage("Fetching GPS and checking out...");

    try {
      const loc = await locationPromise.current;
      if (!loc) throw new Error("Could not get location");

      const lat = loc.latitude ? loc.latitude.toString() : "";
      const lng = loc.longitude ? loc.longitude.toString() : "";

      const activeSite =
        todaySites.length > 0
          ? todaySites[todaySites.length - 1].site
          : "Unknown Site";
      const attendanceId =
        activeAttendanceId ??
        todaySites[todaySites.length - 1]?.attendanceId ??
        null;

      if (!attendanceId) {
        throw new Error(
          "Unable to find active attendance record for checkout.",
        );
      }

      const getNormalizedUri = (uri: string) => {
        if (Platform.OS === "android" && !uri.startsWith("file://")) {
          return `file://${uri}`;
        }
        return uri;
      };

      const payload: CheckOutPayload = {
        CheckOutTime: getUTCISOString(),
        CheckOutLatitude: lat,
        CheckOutLongitude: lng,
        IsWithinGeoFence: true,
        DynamicAddress: loc.address || activeSite,
        LocationSource: "GPS",
        AccuracyMeters: loc.accuracy ? Math.round(loc.accuracy) : 5,
        ImageTimestamp: getUTCISOString(),
        DeviceInfo: `${Device.deviceName || "Unknown"} | ${Device.modelName || Device.modelId || "Unknown"}`,
        Address: activeSite,
        FaceVerified: true,
      };

      if (photoUri) {
        payload.checkOutImage = {
          uri: getNormalizedUri(photoUri),
          name: `checkout-${Date.now()}.jpg`,
          type: "image/jpeg",
        };
      }

      console.log("Checkout photo:", photoUri);
      console.log("Payload image:", payload.checkOutImage);

      await checkOut(attendanceId, payload);

      // Update static UI state
      const timeStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCheckOutTime(timeStr);
      setIsPunchedIn(false);

      setTodaySites((prev) => {
        const newSites = [...prev];
        if (newSites.length > 0) {
          newSites[newSites.length - 1].checkOut = timeStr;
        }
        return newSites;
      });

      Alert.alert(
        "Success",
        "Checked out successfully! Data logged to console.",
      );
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message || err?.response?.data || err?.message;
      console.log(
        "Checkout request failed",
        err?.response?.status,
        err?.response?.data,
      );
      Alert.alert("Error", String(serverMessage || "Failed to check out"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={processing} message={loadingMessage} />
      <CameraModal
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapture}
      />
      <SiteModal
        visible={siteModalOpen}
        onSubmit={handleSiteSubmit}
        onClose={() => setSiteModalOpen(false)}
      />

      <LinearGradient
        colors={["#f8f9fa", "#f1f3f5", "#e9ecef"]}
        style={styles.root}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: 10,
              paddingBottom: insets.bottom + 100,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Header greeting={greeting} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <Pressable>
              <Text style={styles.seeAll}>View Details</Text>
            </Pressable>
          </View>

          <AttendanceCard
            currentTime={currentTime}
            currentDate={currentDate}
            isPunchedIn={isPunchedIn}
            checkInTime={checkInTime}
            checkOutTime={checkOutTime}
            workingHrs={workingHrs}
            onPunch={handlePunch}
          />

          <TodaySitesCard sites={todaySites} isPunchedIn={isPunchedIn} />

          {todaySites.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No sites visited today</Text>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </LinearGradient>
    </>
  );
}

// Styles
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6b7280",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#9ca3af",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#f8f9fa",
  },
  greetingSmall: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 2,
    fontWeight: "500",
  },
  greeting: {
    color: "#6b7280",
    fontSize: 20,
    fontWeight: "400",
  },
  greetingBold: {
    color: "#111827",
    fontWeight: "800",
  },
  menuBtn: {
    width: 42,
    height: 42,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
    marginTop: 10,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  seeAll: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
  },
});
