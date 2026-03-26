import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// Helper to assign icons based on subject name
const getIconForSubject = (name) => {
  const icons = {
    Math: "📐",
    Physics: "⚛️",
    Chemistry: "🧪",
    Biology: "🧬",
    "Computer Science": "💻",
    "Pakistan Studies": "🇵🇰",
    English: "📝",
    Urdu: "📜",
    Statistics: "📊",
  };
  return icons[name] || "📚";
};

// Define which subjects require a premium account
const PREMIUM_SUBJECTS = ["English", "Urdu"];

export default function SubjectsScreen() {
  const router = useRouter();
  const { classId, userEmail } = useLocalSearchParams();

  // --- Theme Setup ---
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const styles = createStyles(colors);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectList, setSubjectList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      try {
        // 1. Fetch User Role
        if (userEmail) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("email", userEmail)
            .single();

          if (!userError && userData) {
            setUserRole(userData.role);
          } else {
            setUserRole("student"); // Fallback
          }
        }

        // 2. Fetch Subjects for this Grade
        const gradeName = `Class ${classId}`;
        const { data: subjectData, error: subjectError } = await supabase
          .from("grade_subjects")
          .select(
            `
            subjects ( id, name ),
            grades!inner ( name )
          `,
          )
          .eq("grades.name", gradeName);

        if (subjectError) {
          console.error("Error fetching subjects:", subjectError);
        } else if (subjectData) {
          const formattedSubjects = subjectData.map((item) => ({
            id: item.subjects.name,
            dbId: item.subjects.id,
            label: item.subjects.name,
            icon: getIconForSubject(item.subjects.name),
          }));
          setSubjectList(formattedSubjects);
        }
      } catch (err) {
        console.error("Unexpected error loading subjects screen:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [classId, userEmail]);

  const handleContinue = () => {
    if (!selectedSubject) return;

    const targetRoute =
      userRole === "admin"
        ? "/screens/configuration"
        : "/screens/studentConfiguration";

    router.push({
      pathname: targetRoute,
      params: {
        classId: classId,
        subjectId: selectedSubject,
        userEmail: userEmail,
      },
    });
  };

  const isPremiumUser = userRole === "admin" || userRole === "premium";

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack.Screen
        options={{
          title: `Class ${classId} Subjects`,
          headerStyle: { backgroundColor: colors.card }, // Matches the theme perfectly
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false, // Cleaner, modern look
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Choose a Subject</Text>
          <Text style={styles.subtitle}>
            Showing live curriculum for Class {classId}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.accent}
            style={{ marginTop: 50 }}
          />
        ) : (
          <View style={styles.grid}>
            {subjectList.map((item) => {
              // Determine if this specific card should be locked for this user
              const isLocked =
                PREMIUM_SUBJECTS.includes(item.label) && !isPremiumUser;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.card,
                    selectedSubject === item.id && styles.activeCard,
                    isLocked && { opacity: 0.5 }, // Dim the card if it's locked
                  ]}
                  onPress={() => {
                    if (isLocked) {
                      Alert.alert(
                        "Premium Subject 🔒",
                        `Unlock ${item.label} and more by upgrading to a Premium account!`,
                      );
                      return; // Prevent selection
                    }
                    setSelectedSubject(item.id);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.cardInner,
                      selectedSubject === item.id && styles.activeCardInner,
                      isLocked && styles.lockedCardInner,
                    ]}
                  >
                    <Text style={styles.cardIcon}>
                      {isLocked ? "🔒" : item.icon}
                    </Text>

                    <Text
                      style={[
                        styles.cardLabel,
                        selectedSubject === item.id && styles.activeText,
                        isLocked && styles.lockedText,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {selectedSubject === item.id && (
                      <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.generateBtn,
            !selectedSubject && styles.generateBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedSubject || isLoading}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.btnInner,
              !selectedSubject && styles.btnInnerDisabled,
            ]}
          >
            <Text
              style={[
                styles.btnText,
                !selectedSubject && styles.btnTextDisabled,
              ]}
            >
              {selectedSubject
                ? "Configure Exam Details"
                : "Select a Subject First"}
            </Text>
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
      paddingBottom: 40,
    },
    titleContainer: {
      marginVertical: 15,
      marginBottom: 25,
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    card: {
      width: (width - 55) / 2,
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
      justifyContent: "center",
      height: 120,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    activeCardInner: {
      borderColor: colors.accent,
      backgroundColor: colors.accent, // Sage Teal highlight
    },
    lockedCardInner: {
      backgroundColor: colors.background, // Sinks into the background
      borderColor: colors.border,
    },
    cardIcon: {
      fontSize: 32,
      marginBottom: 10,
    },
    cardLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textPrimary,
      textAlign: "center",
    },
    activeCard: {
      elevation: 8,
    },
    activeText: {
      color: "#FFFFFF", // White text on Sage Teal
    },
    lockedText: {
      color: colors.textSecondary,
    },
    checkmarkContainer: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "#fff",
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    checkmark: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "bold",
    },
    generateBtn: {
      borderRadius: 16,
      overflow: "hidden",
      elevation: 5,
      marginTop: 10,
      shadowColor: colors.primaryBtn,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },
    generateBtnDisabled: {
      elevation: 0,
      shadowOpacity: 0,
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
    btnInnerDisabled: {
      backgroundColor: colors.border, // Muted grey/teal for disabled state
    },
    btnText: {
      color: colors.primaryBtnText, // Text Charcoal
      fontWeight: "bold",
      fontSize: 18,
      textAlign: "center",
    },
    btnTextDisabled: {
      color: colors.textSecondary,
    },
  });
