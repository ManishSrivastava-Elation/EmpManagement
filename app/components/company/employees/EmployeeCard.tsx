// components/company/employees/EmployeeCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Employee, EmployeeStatus, EmployeeApiItem } from "./types";
import { formatDateTime } from "@/utils/timeHelpers";

// ─── Avatar color (deterministic, from name) ───────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#E5E1FA", fg: "#6D5DD3" }, // lavender
  { bg: "#DCEAFE", fg: "#3B82F6" }, // blue
  { bg: "#DAF5E4", fg: "#22A55E" }, // green
  { bg: "#FDE6CB", fg: "#F08A1F" }, // orange
  { bg: "#FCE0EC", fg: "#E0457A" }, // pink
  { bg: "#FFF1C2", fg: "#C8920B" }, // amber
];

const getAvatarPalette = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  EmployeeStatus,
  { color: string; bg: string; label: string }
> = {
  ACTIVE: { color: "#1A9A5C", bg: "#DCF6E6", label: "ACTIVE" },
  INACTIVE: { color: "#E0445F", bg: "#FCE3E7", label: "INACTIVE" },
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface EmployeeCardProps {
  employee: EmployeeApiItem;
  onStatusChange?: (
    employee: EmployeeApiItem,
    newStatus: EmployeeStatus,
  ) => Promise<void>;
  onVerify?: (employee: EmployeeApiItem) => Promise<void>;
  onPress?: (employee: EmployeeApiItem) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onStatusChange,
  onVerify,
  onPress,
}) => {
  const [status, setStatus] = useState<EmployeeStatus>(employee.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(!!employee.emp_verified);

  const handleVerify = useCallback(async () => {
    setIsVerifying(true);
    try {
      await onVerify?.(employee);
      setVerified(true);
    } finally {
      setIsVerifying(false);
    }
  }, [employee, onVerify]);

  const palette = useMemo(
    () => getAvatarPalette(employee.full_name),
    [employee.full_name],
  );
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE;
  const isActive = status === "ACTIVE";

  const handleCall = useCallback(() => {
    if (!employee.mobile_no) return;
    Linking.openURL(`tel:${employee.mobile_no}`).catch(() => {
      Alert.alert(
        "Unable to place call",
        "Your device cannot open the dialer right now.",
      );
    });
  }, [employee.mobile_no]);

  const handleEmail = useCallback(() => {
    if (!employee.email) return;
    Linking.openURL(`mailto:${employee.email}`).catch(() => {
      Alert.alert(
        "Unable to open mail",
        "No mail app is configured on this device.",
      );
    });
  }, [employee.email]);

  const handleBlockToggle = useCallback(() => {
    const goingTo: EmployeeStatus = isActive ? "INACTIVE" : "ACTIVE";
    const verb = isActive ? "Block" : "Unblock";

    Alert.alert(
      `${verb} ${employee.full_name}?`,
      isActive
        ? "They will lose access immediately. You can unblock them again at any time."
        : "They will regain access immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: verb,
          style: isActive ? "destructive" : "default",
          onPress: async () => {
            const previousStatus = status;
            setIsUpdating(true);
            setStatus(goingTo);
            try {
              await onStatusChange?.(employee, goingTo);
            } catch {
              setStatus(previousStatus);
              Alert.alert(
                "Something went wrong",
                `${employee.full_name} could not be ${isActive ? "blocked" : "unblocked"}. Please try again.`,
              );
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  }, [status, isActive, employee, onStatusChange]);

  return (
    <Pressable
      onPress={onPress ? () => onPress(employee) : undefined}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.cardPressed : null,
      ]}
    >
      {/* ROW 1 */}
      <View style={styles.headerRow}>
        <View style={styles.userSection}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: palette.bg,
              },
            ]}
          >
            <Ionicons name="person" size={22} color={palette.fg} />
          </View>

          <View style={styles.nameWrapper}>
            <Text style={styles.name} numberOfLines={1}>
              {employee.full_name}
            </Text>

            {/* Active / Inactive / Blocked status inline badge */}
            <View style={styles.statusInlineRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusConfig.color },
                ]}
              />
              <Text
                style={[
                  styles.statusInlineText,
                  { color: statusConfig.color },
                ]}
              >
                {statusConfig.label}
              </Text>
            </View>

            {/* Verified / Unverified status badge */}
            {verified ? (
              <View style={styles.verifiedInlineBadge}>
                <Ionicons name="checkmark-circle" size={11} color="#1A9A5C" />
                <Text style={styles.verifiedInlineText}>Verified</Text>
              </View>
            ) : (
              <View style={styles.unverifiedInlineBadge}>
                <Ionicons name="alert-circle-outline" size={11} color="#F08A1F" />
                <Text style={styles.unverifiedInlineText}>Not Verified</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ROW 2 */}

      <View style={styles.middleRow}>
        <View style={styles.contactWrapper}>
          <Pressable onPress={handleEmail} style={styles.detailRow}>
            <Ionicons name="mail-outline" size={15} color="#8A93A3" />

            <Text style={styles.detailText} numberOfLines={1}>
              {employee.email}
            </Text>
          </Pressable>

          <Pressable onPress={handleCall} style={styles.detailRow}>
            <Ionicons name="call-outline" size={15} color="#8A93A3" />

            <Text style={styles.detailText}>{employee.mobile_no}</Text>
          </Pressable>
        </View>

        {/* Action buttons: Verify (if not verified) + Block/Unblock */}
        <View style={styles.actionButtonsGroup}>
          {!verified && (
            <Pressable
              onPress={handleVerify}
              disabled={isVerifying}
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonVerify,
                pressed && styles.actionButtonPressed,
              ]}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#3B82F6" />
                  <Text style={[styles.actionButtonText, { color: "#3B82F6" }]}>Verify</Text>
                </>
              )}
            </Pressable>
          )}

          <Pressable
            onPress={handleBlockToggle}
            disabled={isUpdating}
            style={({ pressed }) => [
              styles.actionButton,
              isActive ? styles.actionButtonBlock : styles.actionButtonUnblock,
              pressed && styles.actionButtonPressed,
            ]}
          >
            {isUpdating ? (
              <ActivityIndicator
                size="small"
                color={isActive ? "#E0445F" : "#1A9A5C"}
              />
            ) : (
              <>
                <Ionicons
                  name={isActive ? "lock-closed-outline" : "lock-open-outline"}
                  size={14}
                  color={isActive ? "#E0445F" : "#1A9A5C"}
                />

                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: isActive ? "#E0445F" : "#1A9A5C",
                    },
                  ]}
                >
                  {isActive ? "Block" : "Unblock"}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ROW 3 */}

      <View style={styles.footerRow}>
        <Ionicons name="calendar-outline" size={14} color="#6D5DD3" />

        <Text style={styles.footerText}>
          Registered on:  {formatDateTime(employee.created_at)}
        </Text>
      </View>
    </Pressable>
  );
};

export default EmployeeCard;


// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e6e7",
  },
  cardPressed: {
    backgroundColor: "#fafafa",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  nameWrapper: {
    marginLeft: 12,
    flex: 1,
  },

  middleRow: {
    flexDirection: "row",
    marginTop: 2,
    justifyContent: "space-between",
    alignItems: "center",
  },

  contactWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  code: {
    fontSize: 12.5,
    color: "#9CA3AF",
    marginTop: 2,
    marginBottom: 8,
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  detailRowPressed: {
    opacity: 0.6,
  },
  detailText: {
    fontSize: 13.5,
    color: "#4b5563",
    flexShrink: 1,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1.5,
    minHeight: 32,
    minWidth: 84,
  },
  actionButtonBlock: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F5C6CD",
  },
  actionButtonUnblock: {
    backgroundColor: "#FFFFFF",
    borderColor: "#BCE8CE",
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
  actionButtonDisabled: {
    opacity: 0.8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  actionButtonsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButtonVerify: {
    backgroundColor: "#FFFFFF",
    borderColor: "#BFDBFE",
  },
  verifiedInlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  verifiedInlineText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1A9A5C",
  },
  unverifiedInlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  unverifiedInlineText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F08A1F",
  },
  statusInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  statusInlineText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f2f4",
    marginVertical: 9,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 12.5,
    color: "#6b7280",
    fontWeight: "500",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    minHeight: 32,
  },
  verifyButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B82F6",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#DCF6E6",
  },
  verifiedBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A9A5C",
  },
});
