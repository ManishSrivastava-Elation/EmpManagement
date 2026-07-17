import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/theme";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { sendOtp, confirmOtp } from "@/services/firebase.service";
import { resendEmailOtp, verifyEmailOtp, markMobileVerified, EntityType } from "@/services/otp.service";

const { colors, spacing, radius, fontSize, fontWeight } = theme;

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 600; // 10 minutes in seconds

export default function VerifyOtp() {
  const { type, value, userId, verificationId, entity_type } = useLocalSearchParams<{
    type: string;
    value: string;
    userId: string;
    verificationId?: string;
    entity_type?: EntityType;
  }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [currentVerificationId, setCurrentVerificationId] = useState<string>(verificationId ?? "");

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const isPhone = type === "phone";

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const updated = [...otp];
    updated[index] = text.slice(-1);
    setOtp(updated);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      Alert.alert("Incomplete OTP", "Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      if (isPhone) {
        const result = await confirmOtp(currentVerificationId, code);
        if (!result) {
          Alert.alert("Verification Failed", "Could not verify OTP. Please try again.");
          return;
        }
        const res = await markMobileVerified(userId as string, (entity_type) as EntityType);
      } else {
        const res = await verifyEmailOtp(value as string, code, entity_type as EntityType);
        if (!res.success) {
          if (Array.isArray(res.error)) {
            const messages = res.error.map((e: { message: string }) => e.message).join("\n");
            Alert.alert("Verification Failed", messages);
          } else {
            Alert.alert("Verification Failed", res.message || "Invalid OTP.");
          }
          return;
        }
      }
      router.replace("/(auth)/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid OTP. Please try again.";
      Alert.alert("Verification Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      if (isPhone) {
        const confirmation = await sendOtp(value as string);
        setCurrentVerificationId(confirmation.verificationId ?? "");
      } else {
        const res = await resendEmailOtp(value as string, entity_type as EntityType);
        if (!res.success) {
          Alert.alert("Resend Failed", res.message || "Could not resend OTP.");
          return;
        }
      }
      setCountdown(RESEND_COUNTDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Could not resend OTP.";
      Alert.alert("Resend Failed", msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.heroSection}>
          <View style={styles.iconBox}>
            <Ionicons
              name={isPhone ? "phone-portrait" : "mail"}
              size={32}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>Enter OTP</Text>

          <Text style={styles.subtitle}>
            A {OTP_LENGTH}-digit code was sent to{"\n"}
            <Text style={styles.highlightedValue}>{value}</Text>
          </Text>
        </View>

        <View style={styles.progressRow}>
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => ( 
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              textContentType="oneTimeCode"
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.btnText}>Verify →</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.resendCountdown}>
              Resend OTP in{" "}
              <Text style={styles.resendCountdownBold}>{formatCountdown(countdown)}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.resendLink}>Resend OTP</Text>
              )}
            </TouchableOpacity>
          )}
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

  backBtn: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
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
    lineHeight: 22,
  },

  highlightedValue: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: spacing.xl,
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

  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  otpInput: {
    width: 48,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    textAlign: "center",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },

  btn: {
    paddingVertical: 14,
    borderRadius: radius.sm,
    alignItems: "center",
    backgroundColor: colors.primary,
  },

  btnDisabled: {
    opacity: 0.6,
  },

  btnText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },

  resendRow: {
    alignItems: "center",
    marginTop: spacing.md,
  },

  resendCountdown: {
    color: colors.textSecondary,
  },

  resendCountdownBold: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },

  resendLink: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
