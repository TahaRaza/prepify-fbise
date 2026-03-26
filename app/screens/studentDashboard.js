import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme"; // 👈 New Import
import { supabase } from "../../supabaseClient";

const { width } = Dimensions.get("window");

export default function StudentDashboard() {
  const router = useRouter();
  const { userName, userEmail } = useLocalSearchParams();

  // --- Theme Setup ---
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const styles = createStyles(colors);

  const [selectedClass, setSelectedClass] = useState("9");
  const [userData, setUserData] = useState({ name: "", email: "" });

  const classes = [
    { id: "9", label: "Class 9", board: "SSC-I", icon: "📚" },
    { id: "10", label: "Class 10", board: "SSC-II", icon: "📖" },
    { id: "11", label: "Class 11", board: "HSSC-I", icon: "🔬" },
    { id: "12", label: "Class 12", board: "HSSC-II", icon: "⚗️" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("full_name, email")
          .eq("email", user.email)
          .single();

        if (data) {
          setUserData({ name: data.full_name, email: data.email });
        }
      }
    };
    fetchUser();
  }, []);

  const initial = userData.name ? userData.name.charAt(0).toUpperCase() : "S";

  const handleBrowsePapers = () => {
    router.push({
      pathname: "/screens/subjects",
      params: { classId: selectedClass, userEmail: userEmail },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack.Screen
        options={{
          title: "Student Dashboard",
          headerShown: false,
        }}
      />

      {/* MODERN HEADER SECTION (Stays Fixed at Top) */}
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.mainTitle}>Ready to Ace the Exam?</Text>
          <Text style={styles.subtitle}>
            Welcome back, {userData.name || "Student"} 👋
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/screens/profile",
              params: { userName: userData.name, userEmail: userData.email },
            })
          }
        >
          <View style={styles.profileBtnInner}>
            <Text style={styles.profileBtnText}>{initial}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Question Bank</Text>
          <Text style={styles.sectionSubtitle}>
            Select a class to practice past papers
          </Text>
        </View>

        {/* Class Grid */}
        <View style={styles.grid}>
          {classes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                selectedClass === item.id && styles.activeCard,
              ]}
              onPress={() => setSelectedClass(item.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.cardInner,
                  selectedClass === item.id && styles.activeCardInner,
                ]}
              >
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.cardLabel,
                    selectedClass === item.id && styles.activeText,
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.cardBoard,
                    selectedClass === item.id && styles.activeSubText,
                  ]}
                >
                  {item.board}
                </Text>
                {selectedClass === item.id && (
                  <View style={styles.checkmarkContainer}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Practice Mode</Text>
          <Text style={styles.infoText}>
            As a student, you can browse and practice questions generated by
            your teachers. Select a class above to get started.
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.generateBtn}
          activeOpacity={0.8}
          onPress={handleBrowsePapers}
        >
          <View style={styles.btnInner}>
            <Text style={styles.btnIcon}>📚</Text>
            <Text style={styles.btnText}>Browse Question Bank</Text>
            <Text style={styles.btnIcon}>→</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
    // Fixed Header Styles
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 15,
      backgroundColor: "transparent",
    },
    titleBlock: {
      flex: 1,
      paddingRight: 10,
    },
    mainTitle: {
      fontSize: 26,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    profileBtn: {
      borderRadius: 25,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      backgroundColor: colors.card,
    },
    profileBtnInner: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.accent, // Sage Teal
      justifyContent: "center",
      alignItems: "center",
    },
    profileBtnText: {
      color: "#FFF", // Keeping white for the text on Sage Teal
      fontSize: 22,
      fontWeight: "bold",
    },
    // Scrollable Content Styles
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    titleContainer: {
      marginVertical: 15,
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    card: {
      width: (width - 55) / 2, // Accounting for padding and gap
      marginBottom: 15,
      borderRadius: 16,
      elevation: 4,
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    cardInner: {
      padding: 20,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    activeCardInner: {
      borderColor: colors.accent,
      backgroundColor: colors.accent, // Turns the whole card Sage Teal when selected
    },
    cardIcon: { fontSize: 32, marginBottom: 10 },
    cardLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.textPrimary,
      textAlign: "center",
    },
    cardBoard: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    activeCard: {
      elevation: 8,
    },
    activeText: {
      color: "#FFFFFF", // White text when Sage Teal is the background
    },
    activeSubText: {
      color: "rgba(255, 255, 255, 0.8)",
    },
    checkmarkContainer: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "#fff",
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    checkmark: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: "bold",
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 25,
      elevation: 3,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent, // Sage Teal highlight
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textPrimary, // Changed to primary for dark mode legibility
      opacity: 0.8, // Slightly faded for visual hierarchy
      lineHeight: 22,
    },
    generateBtn: {
      borderRadius: 16,
      overflow: "hidden",
      elevation: 5,
      shadowColor: colors.primaryBtn,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },
    btnInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 18,
      paddingHorizontal: 24,
      backgroundColor: colors.primaryBtn, // Electric Amber
      borderRadius: 16,
    },
    btnIcon: {
      color: colors.primaryBtnText, // Charcoal Text
      fontSize: 20,
      marginHorizontal: 8,
    },
    btnText: {
      color: colors.primaryBtnText, // Charcoal Text
      fontWeight: "bold",
      fontSize: 18,
      textAlign: "center",
    },
  });
