import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { CV, deleteCV, getCVs } from "@/services/cv";
import { API_BASE_URL } from "@/services/api";

export default function CVScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<string | number | null>(null);

  const { data: cvs = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["cvs"],
    queryFn: getCVs,
    retry: 1,
  });

  function handleUpload() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Upload CV",
      "Open BlastMyCV.com to upload your CV document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Website",
          onPress: () => Linking.openURL(`${API_BASE_URL}/dashboard/cv`),
        },
      ],
    );
  }

  async function handleDelete(cv: CV) {
    Alert.alert("Delete CV", `Remove "${cv.original_name ?? cv.filename ?? "this CV"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(cv.id);
          try {
            await deleteCV(cv.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            queryClient.invalidateQueries({ queryKey: ["cvs"] });
          } catch {
            Alert.alert("Error", "Could not delete CV. Please try again.");
          } finally {
            setDeleting(null);
          }
        },
      },
    ]);
  }

  const topPadding = Platform.OS === "web" ? 67 : insets.top + 16;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 100;

  function renderCV({ item }: { item: CV }) {
    const name = item.original_name ?? item.filename ?? `CV #${item.id}`;
    const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : null;
    const isDeleting = deleting === item.id;
    return (
      <View style={[styles.cvCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.cvIcon, { backgroundColor: `${colors.primary}15` }]}>
          <Feather name="file-text" size={24} color={colors.primary} />
        </View>
        <View style={styles.cvInfo}>
          <Text style={[styles.cvName, { color: colors.foreground }]} numberOfLines={2}>
            {name}
          </Text>
          {date ? (
            <Text style={[styles.cvDate, { color: colors.mutedForeground }]}>
              Uploaded {date}
            </Text>
          ) : null}
          {item.status ? (
            <View style={[styles.cvStatusBadge, {
              backgroundColor: item.status === "active" ? "#dcfce7" : colors.secondary
            }]}>
              <Text style={[styles.cvStatusText, {
                color: item.status === "active" ? "#16a34a" : colors.mutedForeground
              }]}>
                {item.status}
              </Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={styles.deleteBtn}
          disabled={isDeleting}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.destructive} />
          ) : (
            <Feather name="trash-2" size={18} color={colors.destructive} />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My CVs</Text>
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
          onPress={handleUpload}
          activeOpacity={0.85}
          testID="upload-cv-button"
        >
          <Feather name="upload" size={16} color="#fff" />
          <Text style={styles.uploadBtnText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={cvs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCV}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: bottomPadding,
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
              icon="file-text"
              title="No CVs uploaded yet"
              subtitle="Upload your CV to start getting noticed by top recruiters"
              actionLabel="Upload CV"
              onAction={handleUpload}
            />
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!cvs.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  uploadBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cvCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  cvIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cvInfo: {
    flex: 1,
    gap: 4,
  },
  cvName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  cvDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  cvStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    marginTop: 2,
  },
  cvStatusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
  deleteBtn: {
    padding: 4,
  },
});
