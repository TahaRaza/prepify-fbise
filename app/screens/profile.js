import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme"; // 👈 New Import
import { supabase } from "../../supabaseClient";

export default function ProfileScreen() {
  const router = useRouter();
  const { userName, userEmail } = useLocalSearchParams();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- Theme Setup ---
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const styles = createStyles(colors);

  // Fallbacks in case the params haven't loaded or user navigates here directly
  const displayName = userName || "Student Name";
  const displayEmail = userEmail || "student@prepify.edu.pk";

  // Get the first letter of the name for the dummy avatar
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    setIsLoggingOut(false);

    if (error) {
      Alert.alert("Logout Error", error.message);
      return;
    }

    // Replace the entire navigation stack and send them back to login
    router.replace("/screens/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack.Screen
        options={{
          title: "My Profile",
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: "bold" },
          headerShadowVisible: false, // Cleaner, flat look
        }}
      />

      <View style={styles.content}>
        <View style={styles.card}>
          {/* Dummy Profile Picture */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBackground}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>

          {/* User Details */}
          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.emailText}>{displayEmail}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Account Settings */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Status</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.infoValueActive}>Active</Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutBtn, isLoggingOut && styles.logoutBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.logoutBtnText}>Log Out</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- DYNAMIC STYLES ---
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 25,
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    avatarContainer: {
      marginBottom: 15,
      marginTop: -10,
    },
    avatarBackground: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: colors.background, // Creates a nice cutout effect against the card
      backgroundColor: colors.accent, // Sage Teal
    },
    avatarText: {
      fontSize: 40,
      fontWeight: "bold",
      color: "#FFFFFF", // Crisp white on Sage Teal
    },
    nameText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 5,
      textAlign: "center",
    },
    emailText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 20,
      textAlign: "center",
    },
    divider: {
      width: "100%",
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 15,
    },
    infoRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
      paddingHorizontal: 10,
    },
    infoLabel: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    activeBadge: {
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoValueActive: {
      fontSize: 14,
      color: colors.accent,
      fontWeight: "bold",
    },
    logoutBtn: {
      width: "100%",
      backgroundColor: "#DC2626", // A vibrant, universally accessible red
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      elevation: 2,
      shadowColor: "#DC2626",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    logoutBtnDisabled: {
      backgroundColor: "#EF4444",
      opacity: 0.7,
      elevation: 0,
      shadowOpacity: 0,
    },
    logoutBtnText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
