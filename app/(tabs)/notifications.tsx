import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
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
import { useColors } from "@/hooks/useColors";
import {
  Notification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications";

const TYPE_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  order: "package",
  blast: "send",
  response: "inbox",
  system: "bell",
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    retry: 1,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  async function handleMarkRead(n: Notification) {
    if (n.is_read || n.read) return;
    try {
      await markNotificationRead(n.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      // Fail silently
    }
  }

  async function handleMarkAll() {
    if (unreadCount === 0) return;
    try {
      await markAllNotificationsRead();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      // Fail silently
    }
  }

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 16;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 100;

  function renderNotification({ item }: { item: Notification }) {
    const isRead = item.is_read || item.read;
    const icon = TYPE_ICON[item.type ?? "system"] ?? "bell";
    const title = item.title ?? "Notification";
    const body = item.message ?? item.body ?? "";
    const date = item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    return (
      <TouchableOpacity
        style={[
          styles.notifCard,
          {
            backgroundColor: isRead ? colors.card : `${colors.primary}08`,
            borderColor: isRead ? colors.border : `${colors.primary}30`,
          },
        ]}
        onPress={() => handleMarkRead(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.notifIcon, { backgroundColor: isRead ? colors.secondary : `${colors.primary}15` }]}>
          <Feather name={icon} size={18} color={isRead ? colors.mutedForeground : colors.primary} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifTitleRow}>
            <Text style={[styles.notifTitle, { color: colors.foreground }]} numberOfLines={1}>
              {title}
            </Text>
            {!isRead ? (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            ) : null}
          </View>
          {body ? (
            <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={2}>
              {body}
            </Text>
          ) : null}
          {date ? (
            <Text style={[styles.notifDate, { color: colors.mutedForeground }]}>{date}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
          {unreadCount > 0 ? (
            <Text style={[styles.unreadLabel, { color: colors.primary }]}>
              {unreadCount} unread
            </Text>
          ) : null}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAll}
            style={styles.markAllBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderNotification}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: bottomPadding,
            gap: 10,
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
              icon="bell"
              title="No notifications"
              subtitle="You're all caught up! New activity will appear here."
            />
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!notifications.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  unreadLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  markAllBtn: {
    paddingTop: 4,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notifCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  notifBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  notifDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
