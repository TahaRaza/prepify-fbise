// app/screens/login.js
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors } from "../../constants/theme"; // Adjust path if needed
import { supabase } from "../../supabaseClient";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const styles = createStyles(colors); // This replaces your static styles object

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

      if (authError) throw authError;

      // Fetch the user's profile to get their role and name
      if (authData?.user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, email, full_name, role")
          .eq("id", authData.user.id)
          .single();

        if (userError || !userData) {
          Alert.alert("Profile Error", "Could not retrieve user profile data.");
          return;
        }

        const routeParams = {
          userId: userData.id,
          userEmail: userData.email,
          userName: userData.full_name,
          userRole: userData.role,
        };

        // Route based on role
        if (userData.role === "admin") {
          router.replace({
            pathname: "/screens/home",
            params: routeParams,
          });
        } else {
          router.replace({
            pathname: "/screens/studentDashboard",
            params: routeParams,
          });
        }
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: "Login",
          headerShown: false,
        }}
      />
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* NEW MODERN LOGO & HEADER SECTION */}
        <View style={styles.headerSection}>
          <View style={styles.imageWrapper}>
            <Image
              // Pointing to your new icon location!
              source={require("../../assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.subGreeting}>Sign in to continue learning</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="student@prepify.edu.pk"
                placeholderTextColor="#A5D6A7"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#A5D6A7"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text style={styles.eyeIconText}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1B5E20" />
              <Text style={styles.loadingText}>Signing in...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign Up Link Inside Card */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => router.push("/screens/signup")}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 10,
    },
    headerSection: {
      alignItems: "center",
      marginTop: 20,
      marginBottom: 30,
    },
    imageWrapper: {
      width: 100,
      height: 100,
      borderRadius: 24,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      elevation: 12,
      // Using standard black for the shadow so it works in both light and dark mode
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      overflow: "hidden",
    },
    logoImage: {
      width: "100%",
      height: "100%",
    },
    greeting: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    subGreeting: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    formContainer: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 26,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 6,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 56,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputIcon: {
      fontSize: 16,
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.textPrimary,
    },
    eyeIcon: {
      padding: 8,
    },
    eyeIconText: {
      fontSize: 18,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 24,
    },
    forgotPasswordText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: "500",
    },
    loginButton: {
      backgroundColor: colors.primaryBtn,
      height: 56,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primaryBtn,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    loginButtonText: {
      color: colors.primaryBtnText,
      fontSize: 16,
      fontWeight: "bold",
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    loadingText: {
      marginTop: 12,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "500",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textSecondary,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      paddingBottom: 10,
    },
    footerText: {
      color: colors.textPrimary,
      fontSize: 15,
    },
    signUpLink: {
      color: colors.accent,
      fontSize: 15,
      fontWeight: "bold",
    },
  });
