import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function StudentConfigurationScreen() {
  const router = useRouter();
  const { classId, subjectId } = useLocalSearchParams();

  // --- Theme Setup ---
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const styles = createStyles(colors);

  const [isLoading, setIsLoading] = useState(false);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [isFetchingChapters, setIsFetchingChapters] = useState(true);

  const currentGradeName = `Class ${classId}`;
  const currentSubjectName = subjectId;

  // Fetch Chapters on Mount
  useEffect(() => {
    const fetchChapters = async () => {
      setIsFetchingChapters(true);
      const { data, error } = await supabase
        .from("chapters")
        .select("name, grades!inner(name), subjects!inner(name)")
        .eq("grades.name", currentGradeName)
        .eq("subjects.name", currentSubjectName)
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching chapters:", error);
      } else if (data) {
        setAvailableChapters(data.map((chapter) => chapter.name));
      }
      setIsFetchingChapters(false);
    };

    fetchChapters();
  }, [currentGradeName, currentSubjectName]);

  const toggleChapter = (chapterName) => {
    if (selectedChapters.includes(chapterName)) {
      setSelectedChapters(selectedChapters.filter((c) => c !== chapterName));
    } else {
      setSelectedChapters([...selectedChapters, chapterName]);
    }
  };

  // Generate Practice Paper from DB
  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      let query = supabase
        .from("questions")
        .select(
          `
          *,
          grades!inner(name),
          subjects!inner(name),
          chapters!inner(name)
        `,
        )
        .eq("grades.name", currentGradeName)
        .eq("subjects.name", currentSubjectName)
        .eq("is_active", true);

      if (selectedChapters.length > 0) {
        query = query.in("chapters.name", selectedChapters);
      }

      const { data: allQuestions, error } = await query;

      if (error) {
        console.error("Supabase Query Error:", error);
        throw error;
      }

      if (!allQuestions || allQuestions.length === 0) {
        Alert.alert(
          "Notice",
          "No questions found in the bank for this specific selection. Try selecting more chapters or full book.",
        );
        setIsLoading(false);
        return;
      }

      const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());

      const mcqs = shuffle(
        allQuestions.filter((q) => q.question_type === "MCQ"),
      ).slice(0, 15);
      const shorts = shuffle(
        allQuestions.filter((q) => q.question_type === "SHORT"),
      ).slice(0, 14);
      const longs = shuffle(
        allQuestions.filter((q) => q.question_type === "LONG"),
      ).slice(0, 5);

      if (mcqs.length < 15 || shorts.length < 14 || longs.length < 5) {
        Alert.alert(
          "Partial Paper Generated",
          `We didn't have enough questions to make a full 15/14/5 paper.\nFound: ${mcqs.length} MCQs, ${shorts.length} Shorts, ${longs.length} Longs.`,
        );
      }

      const paperData = { mcqs, shorts, longs };

      router.push({
        pathname: "/screens/results",
        params: {
          examData: JSON.stringify(paperData),
          title: `${currentGradeName} ${currentSubjectName} Practice Paper`,
          gradeName: currentGradeName,
          subjectName: currentSubjectName,
          questionType: "MIXED",
        },
      });
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to retrieve questions from the database.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack.Screen
        options={{
          title: "Practice Test Setup",
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: "bold" },
          headerShadowVisible: false, // Removes the ugly border line below the header
          headerBackTitleVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Target Box */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Selected Target</Text>
          <Text style={styles.summaryValue}>
            {currentGradeName} • {currentSubjectName}
          </Text>
        </View>

        {/* CHAPTER SELECTION */}
        <View style={styles.chapterHeaderRow}>
          <Text style={styles.sectionTitle}>Select Chapters</Text>
          <Text style={styles.chapterStatus}>
            {selectedChapters.length === 0
              ? "Full Book (SLO Mode)"
              : `${selectedChapters.length} Selected`}
          </Text>
        </View>

        {isFetchingChapters ? (
          <ActivityIndicator
            color={colors.accent}
            style={{ marginBottom: 20 }}
          />
        ) : availableChapters.length === 0 ? (
          <Text style={styles.noChaptersText}>
            No active chapters found in database.
          </Text>
        ) : (
          <View style={styles.chipsContainer}>
            {availableChapters.map((chapterName, index) => {
              const isSelected = selectedChapters.includes(chapterName);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleChapter(chapterName)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextActive,
                    ]}
                  >
                    {chapterName.split(":")[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STUDENT FORMAT INFO */}
        <View style={styles.studentInfoBox}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>📋</Text>
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.studentInfoTitle}>Standard Paper Format</Text>
            <Text style={styles.studentInfoText}>
              Your practice paper will be automatically built from our verified
              question bank containing:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• 10 Multiple Choice (MCQs)</Text>
              <Text style={styles.bulletItem}>• 8 Short Questions</Text>
              <Text style={styles.bulletItem}>• 3 Long Questions</Text>
            </View>
          </View>
        </View>

        {/* ACTION BUTTON */}
        <TouchableOpacity
          style={[styles.generateBtn, isLoading && styles.generateBtnDisabled]}
          activeOpacity={0.8}
          onPress={handleGenerate}
          disabled={isLoading}
        >
          <View style={[styles.btnInner, isLoading && styles.btnInnerDisabled]}>
            {isLoading ? (
              <>
                <ActivityIndicator
                  color={colors.primaryBtnText}
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.btnText}>Building Paper...</Text>
              </>
            ) : (
              <>
                <Text style={styles.btnIcon}>📝</Text>
                <Text style={styles.btnText}>Generate Practice Paper</Text>
              </>
            )}
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

    // Summary Card
    summaryCard: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
      borderLeftWidth: 5,
      borderLeftColor: colors.accent, // Sage Teal highlight
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
      marginBottom: 4,
      fontWeight: "600",
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textPrimary,
    },

    // Chapter Section
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    chapterHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      marginTop: 5,
    },
    chapterStatus: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.accent,
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden", // Ensures background respects border radius on iOS
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 25,
    },
    chip: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginRight: 8,
      marginBottom: 8,
    },
    chipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    chipTextActive: {
      color: "#FFFFFF", // Crisp white text on Sage Teal looks best in both modes
    },
    noChaptersText: {
      fontStyle: "italic",
      color: colors.textSecondary,
      marginBottom: 20,
    },

    // Student Info Box
    studentInfoBox: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 35,
    },
    infoIconContainer: { marginRight: 12, paddingTop: 2 },
    infoIcon: { fontSize: 24 },
    infoTextContainer: { flex: 1 },
    studentInfoTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    studentInfoText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    bulletList: { paddingLeft: 5 },
    bulletItem: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: "600",
      marginBottom: 4,
    },

    // Button
    generateBtn: {
      borderRadius: 16,
      overflow: "hidden",
      elevation: 5,
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
      backgroundColor: colors.border,
    },
    btnIcon: {
      fontSize: 20,
      marginRight: 8,
    },
    btnText: {
      color: colors.primaryBtnText, // Text Charcoal ensures high contrast on Amber
      fontWeight: "bold",
      fontSize: 18,
    },
  });
