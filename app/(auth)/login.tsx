import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ApiError } from "@/services/api";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : "Login failed. Please check your credentials.";
      setError(msg);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#1e40af" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 48 }]}>
          <View style={styles.logoWrap}>
            <View style={styles.logoInner}>
              <Feather name="zap" size={36} color="#1e40af" />
            </View>
          </View>
          <Text style={styles.heroTitle}>BlastMyCV</Text>
          <Text style={styles.heroSub}>Get recruited. Get hired.</Text>

          <View style={styles.statsRow}>
            {[
              { label: "Recruiters", value: "10K+" },
              { label: "CVs Blasted", value: "50K+" },
              { label: "Countries", value: "30+" },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.background, paddingBottom: insets.bottom + 32 }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Sign in to your account
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={15} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="email-input"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                testID="password-input"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, { opacity: loading ? 0.75 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            testID="login-button"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Sign In</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: "#1e40af" }]}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#1e40af",
    paddingHorizontal: 28,
    paddingBottom: 48,
    alignItems: "center",
    gap: 10,
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  heroSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    width: "100%",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  loginBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#1e40af",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  loginBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  footerLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
