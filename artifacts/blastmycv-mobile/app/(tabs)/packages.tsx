import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { Package, getPackages, purchasePackage } from "@/services/packages";
import { API_BASE_URL } from "@/services/api";

export default function PackagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [purchasing, setPurchasing] = useState<string | number | null>(null);

  const { data: packages = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["packages"],
    queryFn: getPackages,
    retry: 1,
  });

  async function handlePurchase(pkg: Package) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Buy ${pkg.name}`,
      `You'll be redirected to complete the payment of ${formatPrice(pkg)} for this package.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            setPurchasing(pkg.id);
            try {
              const response = await purchasePackage({ package_id: pkg.id });
              const checkoutUrl = response.checkout_url ?? response.payment_url;
              if (checkoutUrl) {
                await Linking.openURL(checkoutUrl);
              } else {
                Alert.alert(
                  "Order Created",
                  `Your order has been placed. ${response.message ?? ""}`.trim(),
                );
              }
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Purchase failed";
              if (msg.includes("401") || msg.includes("Unauthorized")) {
                Alert.alert("Login Required", "Please log in to purchase a package.");
              } else {
                const purchaseUrl = `${API_BASE_URL}/packages`;
                Alert.alert(
                  "Complete Purchase Online",
                  "Open BlastMyCV.com to complete your purchase?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open", onPress: () => Linking.openURL(purchaseUrl) },
                  ],
                );
              }
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setPurchasing(null);
            }
          },
        },
      ],
    );
  }

  function formatPrice(pkg: Package): string {
    const currency = pkg.currency ?? "USD";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
      }).format(pkg.price);
    } catch {
      return `$${pkg.price}`;
    }
  }

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 16;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 100;

  function renderPackage({ item, index }: { item: Package; index: number }) {
    const isActive = purchasing === item.id;
    const isPopular = item.is_popular;

    return (
      <View
        style={[
          styles.pkgCard,
          isPopular
            ? { backgroundColor: "#1e40af", borderColor: "#1e40af", borderWidth: 2 }
            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        {isPopular && (
          <View style={styles.popularBanner}>
            <Feather name="star" size={11} color="#fff" />
            <Text style={styles.popularBannerText}>MOST POPULAR</Text>
          </View>
        )}

        {!isPopular && item.badge ? (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}

        <Text style={[styles.pkgName, { color: isPopular ? "#fff" : colors.foreground }]}>
          {item.name}
        </Text>

        {item.description ? (
          <Text style={[styles.pkgDesc, { color: isPopular ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.priceRow}>
          <Text style={[styles.pkgPrice, { color: isPopular ? "#fff" : colors.primary }]}>
            {formatPrice(item)}
          </Text>
          {item.duration_days ? (
            <View style={[styles.durationBadge, { backgroundColor: isPopular ? "rgba(255,255,255,0.15)" : colors.secondary }]}>
              <Text style={[styles.durationText, { color: isPopular ? "rgba(255,255,255,0.9)" : colors.mutedForeground }]}>
                {item.duration_days}d
              </Text>
            </View>
          ) : null}
        </View>

        {item.applications_limit ? (
          <View style={[styles.limitRow, { backgroundColor: isPopular ? "rgba(255,255,255,0.1)" : colors.secondary }]}>
            <Feather name="send" size={13} color={isPopular ? "rgba(255,255,255,0.8)" : colors.primary} />
            <Text style={[styles.limitText, { color: isPopular ? "rgba(255,255,255,0.9)" : colors.foreground }]}>
              Up to {item.applications_limit} recruiter blasts
            </Text>
          </View>
        ) : null}

        {Array.isArray(item.features) && item.features.length > 0 ? (
          <View style={styles.features}>
            {item.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureCheck, { backgroundColor: isPopular ? "rgba(255,255,255,0.2)" : `${colors.success}18` }]}>
                  <Feather name="check" size={11} color={isPopular ? "#fff" : colors.success} />
                </View>
                <Text style={[styles.featureText, { color: isPopular ? "rgba(255,255,255,0.9)" : colors.foreground }]}>
                  {f}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.buyBtn,
            isPopular
              ? { backgroundColor: "#fff" }
              : { backgroundColor: colors.primary },
            { opacity: isActive ? 0.7 : 1 },
          ]}
          onPress={() => handlePurchase(item)}
          disabled={isActive}
          activeOpacity={0.85}
          testID={`buy-package-${item.id}`}
        >
          {isActive ? (
            <ActivityIndicator size="small" color={isPopular ? "#1e40af" : "#fff"} />
          ) : (
            <>
              <Text style={[styles.buyBtnText, { color: isPopular ? "#1e40af" : "#fff" }]}>
                Get Started
              </Text>
              <Feather name="arrow-right" size={16} color={isPopular ? "#1e40af" : "#fff"} />
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Packages</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Choose a plan to blast your CV
          </Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: `${colors.primary}12` }]}>
          <Feather name="zap" size={16} color={colors.primary} />
          <Text style={[styles.headerBadgeText, { color: colors.primary }]}>Instant Blast</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={packages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPackage}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: bottomPadding,
            gap: 16,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="shopping-bag"
              title="No packages available"
              subtitle="Check back soon for available CV blast packages"
            />
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!packages.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
  },
  headerBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pkgCard: {
    borderRadius: 20,
    padding: 22,
    gap: 12,
    overflow: "hidden",
  },
  popularBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  popularBannerText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pkgName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  pkgDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pkgPrice: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
  },
  durationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  limitText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  features: {
    gap: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  buyBtn: {
    marginTop: 4,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
