import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { userName, userEmail } = useLocalSearchParams();

  // --- Theme Setup ---
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const styles = createStyles(colors);

  const [selectedClass, setSelectedClass] = useState("9");

  const classes = [
    { id: "9", label: "Class 9", board: "SSC-I", icon: "📚" },
    { id: "10", label: "Class 10", board: "SSC-II", icon: "📖" },
    { id: "11", label: "Class 11", board: "HSSC-I", icon: "🔬" },
    { id: "12", label: "Class 12", board: "HSSC-II", icon: "⚗️" },
  ];

  const activeClass = classes.find((c) => c.id === selectedClass);

  // Grab the first letter of the name for the profile button (or fallback to 'U')
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack.Screen
        options={{
          title: "FBISE Exam Generator",
          headerShown: false,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.mainTitle}>FBISE Exam Generator</Text>
            <Text style={styles.subtitle}>
              Welcome Admin {userName || "User"}
            </Text>
          </View>

          {/* Right Side: Profile Button */}
          <TouchableOpacity
            style={styles.profileBtn}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/screens/profile",
                params: { userName, userEmail },
              })
            }
          >
            <View style={styles.profileBtnInner}>
              <Text style={styles.profileBtnText}>{initial}</Text>
            </View>
          </TouchableOpacity>
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

        {/* Selected Class Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>📋</Text>
            <Text style={styles.infoTitle}>Selected Class Information</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              Class:{" "}
              <Text style={styles.infoHighlight}>
                {activeClass?.label} ({activeClass?.board})
              </Text>
            </Text>
            <Text style={styles.infoSubtext}>
              You will be able to select from all subjects offered for this
              class
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.generateBtn}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/screens/subjects",
              params: { classId: selectedClass, userEmail: userEmail },
            })
          }
        >
          <View style={styles.btnInner}>
            <Text style={styles.btnIcon}>→</Text>
            <Text style={styles.btnText}>Continue to Subject Selection</Text>
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
    content: {
      padding: 20,
      paddingBottom: 30,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 25,
    },
    titleBlock: {
      flex: 1,
      paddingRight: 15,
    },
    profileBtn: {
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      borderRadius: 25,
      backgroundColor: colors.card,
    },
    profileBtnInner: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.accent, // Sage Teal
    },
    profileBtnText: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "bold",
    },
    mainTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
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
      width: (width - 50) / 2,
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
    cardIcon: {
      fontSize: 32,
      marginBottom: 10,
    },
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
    activeCardInner: {
      borderColor: colors.accent,
      backgroundColor: colors.accent, // Sage Teal Highlight
    },
    activeText: {
      color: "#fff",
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
      fontSize: 16,
      fontWeight: "bold",
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    infoHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 8,
    },
    infoIcon: {
      fontSize: 20,
      marginRight: 8,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    infoContent: {
      paddingHorizontal: 4,
    },
    infoText: {
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 6,
    },
    infoHighlight: {
      fontWeight: "bold",
      color: colors.accent,
    },
    infoSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: "italic",
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
      paddingVertical: 16,
      paddingHorizontal: 24,
      backgroundColor: colors.primaryBtn, // Electric Amber
      borderRadius: 16,
    },
    btnIcon: {
      color: colors.primaryBtnText, // Charcoal
      fontSize: 20,
      marginHorizontal: 8,
    },
    btnText: {
      color: colors.primaryBtnText, // Charcoal
      fontWeight: "bold",
      fontSize: 18,
      textAlign: "center",
    },
  });
