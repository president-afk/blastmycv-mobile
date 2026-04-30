import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { API_BASE_URL } from "@/services/api";
import { getCVs } from "@/services/cv";
import { getDashboardStats, getOrders } from "@/services/orders";

interface SettingsRow {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  external?: boolean;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 16;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 100;

  const displayName =
    user?.name ??
    (user?.first_name ? `${user.first_name} ${user?.last_name ?? ""}`.trim() : null) ??
    user?.email?.split("@")[0] ??
    "User";

  const initial = displayName[0]?.toUpperCase() ?? "?";

  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: getOrders, retry: 1 });
  const { data: cvs = [] } = useQuery({ queryKey: ["cvs"], queryFn: getCVs, retry: 1 });
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats, retry: 1 });

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setLoggingOut(false);
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  const settingsRows: SettingsRow[] = [
    {
      icon: "globe",
      label: "Open BlastMyCV.com",
      onPress: () => Linking.openURL(API_BASE_URL),
      external: true,
    },
    {
      icon: "help-circle",
      label: "Support",
      onPress: () => Linking.openURL(`${API_BASE_URL}/support`),
      external: true,
    },
    {
      icon: "shield",
      label: "Privacy Policy",
      onPress: () => Linking.openURL(`${API_BASE_URL}/privacy`),
      external: true,
    },
    {
      icon: "file-text",
      label: "Terms of Service",
      onPress: () => Linking.openURL(`${API_BASE_URL}/terms`),
      external: true,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroSection, { paddingTop: topPadding }]}>
        <View style={[styles.avatarRing, { borderColor: `${colors.primary}30` }]}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{displayName}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{user?.email ?? ""}</Text>
        {user?.role ? (
          <View style={[styles.roleBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="briefcase" size={11} color={colors.primary} />
            <Text style={[styles.roleText, { color: colors.primary }]}>
              {user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: "Orders", value: orders.length },
          { label: "Blasts Sent", value: stats?.blasts_sent ?? "—" },
          { label: "CVs", value: cvs.length },
        ].map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 ? <View style={[styles.statsDivider, { backgroundColor: colors.border }]} /> : null}
            <View style={styles.statsCell}>
              <Text style={[styles.statsCellValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statsCellLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL(`${API_BASE_URL}/dashboard/profile`)}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Feather name="user" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Edit Profile</Text>
            <Feather name="external-link" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL(`${API_BASE_URL}/dashboard`)}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIcon, { backgroundColor: `${colors.accent}15` }]}>
              <Feather name="layout" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Web Dashboard</Text>
            <Feather name="external-link" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: colors.mutedForeground }]}>GENERAL</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {settingsRows.map((row, idx) => (
            <React.Fragment key={row.label}>
              <TouchableOpacity style={styles.row} onPress={row.onPress} activeOpacity={0.7}>
                <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name={row.icon} size={18} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.rowLabel, { color: row.danger ? colors.destructive : colors.foreground }]}>
                  {row.label}
                </Text>
                <Feather
                  name={row.external ? "external-link" : "chevron-right"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
              {idx < settingsRows.length - 1 ? (
                <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
              ) : null}
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: "#fee2e2", opacity: loggingOut ? 0.6 : 1 }]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
          testID="logout-button"
        >
          <Feather name="log-out" size={18} color="#dc2626" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        BlastMyCV Mobile v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 6,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  email: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    marginTop: 4,
  },
  roleText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statsBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  statsCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 3,
  },
  statsDivider: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: 12,
  },
  statsCellValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statsCellLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 48,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    paddingVertical: 16,
  },
});
