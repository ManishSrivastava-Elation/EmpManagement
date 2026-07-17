import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/theme";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { sendOtp } from "@/services/firebase.service";
import { sendEmailOtp } from "@/services/otp.service";

const { colors, spacing, radius, fontSize, fontWeight } = theme;

export default function VerifyAccount() {
  const { phone, email, userId, entity_type } = useLocalSearchParams<{
    phone: string;
    email: string;
    userId: string;
    entity_type?: string;
  }>();

  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleVerifyPhone = async () => {
    if (!phone) return;

    setPhoneLoading(true);

    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const confirmation = await sendOtp(formattedPhone);

      const entityType = (entity_type as string) ?? "employee";
      router.push({
        pathname: "/(auth)/verify-otp",
        params: {
          type: "phone",
          value: formattedPhone,
          userId: String(userId),
          verificationId: confirmation.verificationId,
          entity_type: entityType,
        },
      });
    } catch (err: any) {
      Alert.alert("OTP Error", err?.message || "Failed to send OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const [emailLoading, setEmailLoading] = useState(false);

  const handleVerifyEmail = async () => {
    if (!email) return;

    setEmailLoading(true);
    try {
      // Determine entity_type from userId presence or default to employee
      // The login error response provides email; entity_type is passed via params if available
      const entityType = (entity_type as string) ?? "employee";
      await sendEmailOtp(String(email), entityType as any);

      router.push({
        pathname: "/(auth)/verify-otp",
        params: {
          type: "email",
          value: String(email),
          userId: String(userId),
          entity_type: entityType,
        },
      });
    } catch (err: any) {
      Alert.alert(
        "OTP Error",
        err?.response?.data?.message || err?.message || "Failed to send OTP",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <View style={styles.iconBox}>
            <Ionicons
              name="shield-checkmark"
              size={32}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>Verify Account</Text>

          <Text style={styles.subtitle}>
            Verify your mobile number and email to unlock your account.
          </Text>
        </View>

        <View style={styles.progressRow}>
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        {/* PHONE */}

        <View style={styles.card}>
          <View
            style={[styles.cardAccentBar, { backgroundColor: colors.primary }]}
          />

          <View style={styles.cardTop}>
            <View style={styles.cardIcon}>
              <Ionicons name="call" size={20} color={colors.primary} />
            </View>

            <View style={styles.cardMeta}>
              <Text style={styles.cardLabel}>MOBILE NUMBER</Text>

              <Text style={styles.cardValue} numberOfLines={1}>
                {phone}
              </Text>
            </View>

            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btn}
            onPress={handleVerifyPhone}
            disabled={phoneLoading}
          >
            {phoneLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnText}>Verify Phone →</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>OTP will be sent via SMS</Text>
        </View>

        {/* EMAIL */}

        <View style={styles.card}>
          <View
            style={[styles.cardAccentBar, { backgroundColor: colors.success }]}
          />

          <View style={styles.cardTop}>
            <View
              style={[
                styles.cardIcon,
                {
                  backgroundColor: `${colors.success}15`,
                },
              ]}
            >
              <Ionicons name="mail" size={20} color={colors.success} />
            </View>

            <View style={styles.cardMeta}>
              <Text style={styles.cardLabel}>EMAIL ADDRESS</Text>

              <Text style={styles.cardValue} numberOfLines={1}>
                {email}
              </Text>
            </View>

            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.btn,
              {
                backgroundColor: colors.success,
              },
            ]}
            onPress={handleVerifyEmail}
            disabled={emailLoading}
          >
            {emailLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnText}>Verify Email →</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>OTP will be sent to inbox</Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },

  heroSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },

  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  subtitle: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: spacing.lg,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.border,
  },

  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },

  dotDone: {
    backgroundColor: colors.success,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  cardAccentBar: {
    position: "absolute",
    width: 4,
    left: 0,
    top: 0,
    bottom: 0,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${colors.primary}15`,
  },

  cardMeta: {
    flex: 1,
  },

  cardLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  cardValue: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },

  pendingBadge: {
    paddingHorizontal: spacing.sm,
  },

  pendingText: {
    color: colors.textSecondary,
  },

  btn: {
    paddingVertical: 14,
    borderRadius: radius.sm,
    alignItems: "center",
    backgroundColor: colors.primary,
  },

  btnText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },

  infoText: {
    textAlign: "center",
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
});
