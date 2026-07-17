import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated } from "react-native";

export default function SubscriptionSkeleton() {
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  const renderCardSkeleton = (key: number) => (
    <Animated.View key={key} style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox} />
        <View style={styles.titleWrap}>
          <View style={styles.titleLine} />
          <View style={styles.badgeLine} />
        </View>
        <View style={styles.priceWrap}>
          <View style={styles.priceLine} />
          <View style={styles.priceCycleLine} />
        </View>
      </View>
      <View style={styles.descLine1} />
      <View style={styles.descLine2} />
      <View style={styles.detailsRow}>
        <View style={styles.detailItem} />
        <View style={styles.detailItem} />
        <View style={styles.detailItem} />
      </View>
      <View style={styles.button} />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.banner, { opacity: fadeAnim }]} />
      {renderCardSkeleton(1)}
      {renderCardSkeleton(2)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  banner: {
    height: 120,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 6,
  },
  titleLine: {
    height: 16,
    width: "70%",
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  badgeLine: {
    height: 12,
    width: "40%",
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  priceWrap: {
    alignItems: "flex-end",
    gap: 4,
  },
  priceLine: {
    height: 18,
    width: 60,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  priceCycleLine: {
    height: 10,
    width: 40,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  descLine1: {
    height: 12,
    width: "90%",
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 6,
  },
  descLine2: {
    height: 12,
    width: "60%",
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    paddingBottom: 14,
    marginBottom: 16,
  },
  detailItem: {
    height: 24,
    width: "28%",
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  button: {
    height: 48,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
  },
});
