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
  BLOCKED: { color: "#E0445F", bg: "#FCE3E7", label: "BLOCKED" },
};

const formatRegisteredDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface EmployeeCardProps {
  employee: EmployeeApiItem;
  onStatusChange?: (
    employee: EmployeeApiItem,
    newStatus: EmployeeStatus,
  ) => Promise<void>;
  onPress?: (employee: EmployeeApiItem) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onStatusChange,
  onPress,
}) => {
  const [status, setStatus] = useState<EmployeeStatus>(employee.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const palette = useMemo(
    () => getAvatarPalette(employee.full_name),
    [employee.full_name],
  );
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE;
  const isBlocked = status === "BLOCKED";

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
    const goingTo: EmployeeStatus = isBlocked ? "ACTIVE" : "BLOCKED";
    const verb = isBlocked ? "Unblock" : "Block";

    Alert.alert(
      `${verb} ${employee.full_name}?`,
      isBlocked
        ? "They will regain access immediately."
        : "They will lose access immediately. You can unblock them again at any time.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: verb,
          style: isBlocked ? "default" : "destructive",
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
                `${employee.full_name} could not be ${isBlocked ? "unblocked" : "blocked"}. Please try again.`,
              );
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  }, [status, isBlocked, employee, onStatusChange]);

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

            <Text style={styles.code}>{employee.employee_code}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: statusConfig.bg,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: statusConfig.color,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: statusConfig.color,
              },
            ]}
          >
            {statusConfig.label}
          </Text>
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

        <Pressable
          onPress={handleBlockToggle}
          disabled={isUpdating}
          style={({ pressed }) => [
            styles.actionButton,
            isBlocked ? styles.actionButtonUnblock : styles.actionButtonBlock,
            pressed && styles.actionButtonPressed,
          ]}
        >
          {isUpdating ? (
            <ActivityIndicator
              size="small"
              color={isBlocked ? "#1A9A5C" : "#E0445F"}
            />
          ) : (
            <>
              <Ionicons
                name={isBlocked ? "lock-open-outline" : "lock-closed-outline"}
                size={14}
                color={isBlocked ? "#1A9A5C" : "#E0445F"}
              />

              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: isBlocked ? "#1A9A5C" : "#E0445F",
                  },
                ]}
              >
                {isBlocked ? "Unblock" : "Block"}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.divider} />

      {/* ROW 3 */}

      <View style={styles.footerRow}>
        <Ionicons name="calendar-outline" size={14} color="#6D5DD3" />

        <Text style={styles.footerText}>
          Registered on:  {formatRegisteredDate(employee.created_at)}
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
});
