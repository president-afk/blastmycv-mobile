import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
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
import StatusBadge from "@/components/StatusBadge";
import { useColors } from "@/hooks/useColors";
import { Order, getOrders } from "@/services/orders";
import { router } from "expo-router";

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: orders = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    retry: 1,
  });

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 16;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 100;

  function renderOrder({ item }: { item: Order }) {
    const name = item.package?.name ?? `Order #${item.id}`;
    const date = item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    }) : null;
    const expiresAt = item.expires_at ? new Date(item.expires_at) : null;
    const isExpired = expiresAt ? expiresAt < new Date() : false;
    const price = item.amount ?? item.price;
    const currency = item.currency ?? "USD";
    const formattedPrice = price != null ? (() => {
      try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(price);
      } catch {
        return `$${price}`;
      }
    })() : null;

    return (
      <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.orderTop}>
          <View style={[styles.orderIconWrap, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="package" size={22} color={colors.primary} />
          </View>
          <View style={styles.orderMeta}>
            <Text style={[styles.orderName, { color: colors.foreground }]} numberOfLines={1}>
              {name}
            </Text>
            {date ? (
              <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>
                {date}
              </Text>
            ) : null}
          </View>
          <StatusBadge status={isExpired && item.status === "active" ? "expired" : item.status} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.orderDetails}>
          {formattedPrice ? (
            <View style={styles.detailRow}>
              <Feather name="credit-card" size={14} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                {formattedPrice}
              </Text>
            </View>
          ) : null}
          {expiresAt ? (
            <View style={styles.detailRow}>
              <Feather name="calendar" size={14} color={isExpired ? colors.destructive : colors.mutedForeground} />
              <Text style={[styles.detailText, {
                color: isExpired ? colors.destructive : colors.mutedForeground
              }]}>
                {isExpired ? "Expired " : "Expires "}{expiresAt.toLocaleDateString()}
              </Text>
            </View>
          ) : null}
          {item.recruiter_blast_count != null ? (
            <View style={styles.detailRow}>
              <Feather name="send" size={14} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                {item.recruiter_blast_count} recruiter{item.recruiter_blast_count !== 1 ? "s" : ""} reached
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Orders</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {orders.length} {orders.length === 1 ? "order" : "orders"} total
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrder}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: bottomPadding,
            gap: 12,
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
              icon="list"
              title="No orders yet"
              subtitle="Purchase a package to start blasting your CV to recruiters"
              actionLabel="View Packages"
              onAction={() => router.push("/(tabs)/packages")}
            />
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!orders.length}
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
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  orderCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  orderTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  orderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  orderMeta: {
    flex: 1,
  },
  orderName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  orderDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  orderDetails: {
    padding: 14,
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
