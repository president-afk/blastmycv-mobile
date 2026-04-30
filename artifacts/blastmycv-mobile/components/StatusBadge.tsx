import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = useColors();

  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: "#dcfce7", text: "#16a34a", label: "Active" },
    pending: { bg: "#fef9c3", text: "#ca8a04", label: "Pending" },
    processing: { bg: "#dbeafe", text: "#1d4ed8", label: "Processing" },
    completed: { bg: "#f3f4f6", text: "#6b7280", label: "Completed" },
    cancelled: { bg: "#fee2e2", text: "#dc2626", label: "Cancelled" },
  };

  const config = statusMap[status?.toLowerCase()] ?? {
    bg: colors.secondary,
    text: colors.mutedForeground,
    label: status ?? "Unknown",
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
