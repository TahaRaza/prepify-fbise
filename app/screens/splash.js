import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../supabaseClient";

export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 1. Start the animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Check the session AND route based on role
    const checkUserAndNavigate = async () => {
      // Create a timer promise that resolves after exactly 2.5 seconds
      const minimumDelay = new Promise((resolve) => setTimeout(resolve, 2500));

      let targetRoute = "/screens/login";
      let routeParams = {};

      try {
        // Grab the session from AsyncStorage
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // If logged in, fetch their specific profile to check the role
          const { data: userData, error } = await supabase
            .from("users")
            .select("role, full_name, email")
            .eq("id", session.user.id)
            .single();

          if (!error && userData) {
            // Decide the route based on the database role!
            targetRoute =
              userData.role === "admin"
                ? "/screens/home"
                : "/screens/studentDashboard";

            // Pass the parameters along so the dashboards can say "Welcome Name!" immediately
            routeParams = {
              userName: userData.full_name,
              userEmail: userData.email,
            };
          }
        }
      } catch (error) {
        console.error("Splash Screen Auth Error:", error);
      }

      // Wait for whichever took longer: the 2.5s animation timer, or the database fetch
      await minimumDelay;

      // Navigate to the correct screen
      router.replace({
        pathname: targetRoute,
        params: routeParams,
      });
    };

    checkUserAndNavigate();
  }, []);

  return (
    <LinearGradient
      colors={["#4BA26A", "#1B5E20", "#0D3311"]}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: "Login",
          headerShown: false,
        }}
      />
      <StatusBar style="light" hidden={true} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>PREPIFY</Text>
        <Text style={styles.subtitle}>FBISE Assessment Hub</Text>

        <Text style={styles.loadingText}>Loading curriculum...</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  imageWrapper: {
    width: 130,
    height: 130,
    borderRadius: 32,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#E8F5E9",
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  loadingText: {
    marginTop: 50,
    fontSize: 14,
    color: "#A5D6A7",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
});
