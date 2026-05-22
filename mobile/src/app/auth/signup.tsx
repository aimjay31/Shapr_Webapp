import { useState } from "react";
import {
  View, Text, TextInput, Pressable, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8000'
  : 'http://192.168.18.9:8000';

export default function Signup() {
  const router = useRouter();
  const { colors } = useTheme();

  const [username, setUsername]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const handleSignup = async () => {
    setError("");
    if (!username || !email || !password) { setError("All fields are required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/user/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { setError("Server error. Try again."); return; }
      if (response.ok) {
        Alert.alert("Success", "Account created!", [
          { text: "Login", onPress: () => router.replace("/auth/login") },
        ]);
      } else {
        setError(JSON.stringify(data));
      }
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const inputBg = colors.card4 ?? (colors.background === "#f0edf8" ? "#f3f4f6" : "#16162a");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.backgroundAuth }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>

        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text style={{
            fontSize: 40, fontWeight: "900",
            color: colors.brand,
            letterSpacing: -1,
          }}>
            ShapR
          </Text>
          <Text style={{ fontSize: 16, color: colors.textMuted, marginTop: 6, fontWeight: "500" }}>
            Start your focus journey
          </Text>
        </View>

        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 28,
          borderWidth: 1,
          borderColor: colors.borderInput,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.06,
          shadowRadius: 20,
          elevation: 5,
        }}>

          {error !== "" && (
            <View style={{ backgroundColor: "#fee2e2", borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: "#dc2626", fontSize: 13, fontWeight: "600" }}>{error}</Text>
            </View>
          )}

          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 }}>Username</Text>
          <View style={{
            flexDirection: "row", alignItems: "center", backgroundColor: inputBg,
            borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderInput,
            marginBottom: 16, paddingHorizontal: 14,
          }}>
            <Ionicons name="person-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={username} onChangeText={setUsername}
              placeholder="choose_a_username" placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              style={{ flex: 1, paddingVertical: 14, paddingLeft: 10, color: colors.text, fontSize: 15 }}
            />
          </View>

          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 }}>Email Address</Text>
          <View style={{
            flexDirection: "row", alignItems: "center", backgroundColor: inputBg,
            borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderInput,
            marginBottom: 16, paddingHorizontal: 14,
          }}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={email} onChangeText={setEmail}
              placeholder="name@company.com" placeholderTextColor={colors.textMuted}
              keyboardType="email-address" autoCapitalize="none"
              style={{ flex: 1, paddingVertical: 14, paddingLeft: 10, color: colors.text, fontSize: 15 }}
            />
          </View>

          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 }}>Password</Text>
          <View style={{
            flexDirection: "row", alignItems: "center", backgroundColor: inputBg,
            borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderInput,
            marginBottom: 24, paddingHorizontal: 14,
          }}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={password} onChangeText={setPassword}
              placeholder="min. 8 characters" placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              style={{ flex: 1, paddingVertical: 14, paddingLeft: 10, color: colors.text, fontSize: 15 }}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)}>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 12 }}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSignup} disabled={loading}
            style={{
              backgroundColor: colors.brand,
              padding: 16, borderRadius: 12,
              alignItems: "center", flexDirection: "row",
              justifyContent: "center", gap: 8,
              opacity: loading ? 0.7 : 1,
              shadowColor: "#6a0dad",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.30,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </Pressable>
        </View>

        <View style={{ marginTop: 24, alignItems: "center" }}>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            Already have an account?{" "}
            <Text
              style={{ color: colors.brand, fontWeight: "700" }}
              onPress={() => router.replace("/auth/login")}
            >
              Log in
            </Text>
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}