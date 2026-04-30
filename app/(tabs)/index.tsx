import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { getDashboardStats, getOrders } from "@/services/orders";

const STATUS_COLOR: Record<string, string> = {
  active: "#22c55e",
  completed: "#3b82f6",
  expired: "#ef4444",
  pending: "#f59e0b",
};

function StatCard({
  icon,
  label,
  value,
  color,
  trend,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | number;
  color: string;
  trend?: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {trend ? (
        <Text style={[styles.statTrend, { color: color }]}>{trend}</Text>
      ) : null}
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    retry: 1,
  });

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    retry: 1,
  });

  const isRefreshing = statsQuery.isFetching || ordersQuery.isFetching;

  function onRefresh() {
    statsQuery.refetch();
    ordersQuery.refetch();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const displayName =
    (user?.firstName ? `${user.firstName} ${user?.lastName ?? ""}`.trim() : null) ??
    user?.name ??
    user?.email?.split("@")[0] ??
    "there";

  const stats = statsQuery.data;
  const recentOrders = (ordersQuery.data ?? []).slice(0, 3);

  const topPaddingStyle = Platform.OS === "web" ? { paddingTop: 67 } : { paddingTop: insets.top + 16 };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        topPaddingStyle,
        { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting},</Text>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.85}
        >
          <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? "?"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.blastBanner}
        onPress={() => router.push("/(tabs)/packages")}
        activeOpacity={0.9}
      >
        <View style={styles.blastBannerContent}>
          <View style={styles.blastBannerTag}>
            <Feather name="zap" size={10} color="#fff" />
            <Text style={styles.blastBannerTagText}>INSTANT BLAST</Text>
          </View>
          <Text style={styles.blastBannerTitle}>Blast Your CV Today</Text>
          <Text style={styles.blastBannerSub}>Get noticed by top recruiters instantly</Text>
        </View>
        <View style={styles.blastBannerArrow}>
          <Feather name="arrow-right" size={22} color="rgba(255,255,255,0.9)" />
        </View>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
        {statsQuery.isFetching && !statsQuery.isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : null}
      </View>

      {statsQuery.isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <StatCard
            icon="package"
            label="Active Orders"
            value={stats?.active_orders ?? (ordersQuery.data?.filter((o) => o.status === "active").length ?? 0)}
            color={colors.primary}
          />
          <StatCard
            icon="send"
            label="Blasts Sent"
            value={stats?.blasts_sent ?? "—"}
            color={colors.accent}
          />
          <StatCard
            icon="inbox"
            label="Responses"
            value={stats?.responses_received ?? "—"}
            color="#22c55e"
          />
          <StatCard
            icon="layers"
            label="Total Orders"
            value={stats?.total_orders ?? (ordersQuery.data?.length ?? 0)}
            color="#8b5cf6"
          />
        </View>
      )}

      <View style={styles.quickActionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {[
            { label: "Upload CV", icon: "upload" as const, route: "/(tabs)/cv" as const, color: colors.primary },
            { label: "Buy Package", icon: "shopping-bag" as const, route: "/(tabs)/packages" as const, color: colors.accent },
            { label: "My Orders", icon: "list" as const, route: "/(tabs)/orders" as const, color: "#8b5cf6" },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(a.route);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${a.color}18` }]}>
                <Feather name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {recentOrders.length > 0 ? (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/orders")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.ordersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {recentOrders.map((order, idx) => {
              const statusColor = STATUS_COLOR[order.status ?? ""] ?? colors.mutedForeground;
              return (
                <React.Fragment key={String(order.id)}>
                  {idx > 0 ? <View style={[styles.orderDivider, { backgroundColor: colors.border }]} /> : null}
                  <View style={styles.orderRow}>
                    <View style={[styles.orderStatusDot, { backgroundColor: statusColor }]} />
                    <View style={styles.orderInfo}>
                      <Text style={[styles.orderName, { color: colors.foreground }]} numberOfLines={1}>
                        {order.package?.name ?? `Order #${order.id}`}
                      </Text>
                      <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                      </Text>
                    </View>
                    <View style={[styles.orderStatusBadge, { backgroundColor: `${statusColor}18` }]}>
                      <Text style={[styles.orderStatusText, { color: statusColor }]}>
                        {order.status ?? "—"}
                      </Text>
                    </View>
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  name: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    maxWidth: 220,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  blastBanner: {
    borderRadius: 20,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e40af",
  },
  blastBannerContent: {
    flex: 1,
    gap: 4,
  },
  blastBannerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 4,
  },
  blastBannerTagText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  blastBannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  blastBannerSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  blastBannerArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  loadingRow: {
    paddingVertical: 20,
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: 16,
    gap: 4,
    borderWidth: 1,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statTrend: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  quickActionsSection: {
    gap: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  ordersCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  orderDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 20,
  },
  orderStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  orderDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  orderStatusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
});
