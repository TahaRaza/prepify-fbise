import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import axios from "axios";

import { supabase } from "../../supabaseClient";

export default function ConfigurationScreen() {
  const router = useRouter();
  const { classId, subjectId } = useLocalSearchParams();

  // Form State
  const [questionType, setQuestionType] = useState("MCQ");
  const [numQuestions, setNumQuestions] = useState(40);
  const [isLoading, setIsLoading] = useState(false);

  // Chapter State
  const [availableChapters, setAvailableChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [isFetchingChapters, setIsFetchingChapters] = useState(true);

  const currentGradeName = `Class ${classId}`;
  const currentSubjectName = subjectId;

  // Fetch Chapters from Supabase on Mount
  useEffect(() => {
    const fetchChapters = async () => {
      setIsFetchingChapters(true);

      // We use Supabase inner joins to find the chapters that match
      // the exact string names of the grade and subject
      const { data, error } = await supabase
        .from("chapters")
        .select("name, grades!inner(name), subjects!inner(name)")
        .eq("grades.name", currentGradeName)
        .eq("subjects.name", currentSubjectName)
        .eq("is_active", true)
        .order("id", { ascending: true }); // Keeps units in numerical order

      if (error) {
        console.error("Error fetching chapters:", error);
      } else if (data) {
        // Extract just the name string from the returned objects
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

  const handleGenerate = async () => {
    setIsLoading(true);

    const payload = {
      grade: currentGradeName,
      subject: currentSubjectName,
      chapters: selectedChapters,
      question_type: questionType,
      num_questions: numQuestions,
    };

    const API_URL = "http://192.168.20.128:8000/generate";

    try {
      const response = await axios.post(API_URL, payload);

      router.push({
        pathname: "/screens/results",
        params: {
          examData: JSON.stringify(response.data),
          title: `${currentGradeName} ${currentSubjectName} Paper`,
          gradeName: currentGradeName, // ADD THIS
          subjectName: currentSubjectName, // ADD THIS
          questionType: questionType, // ADD THIS
        },
      });
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert(
        "Generation Failed",
        "Could not connect to the Gemini backend.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <Stack.Screen
          options={{
            title: "Configure Paper",
            headerShown: true,
            headerStyle: { backgroundColor: "#1B5E20" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            headerBackTitleVisible: false,
          }}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Selected Target</Text>
            <Text style={styles.summaryValue}>
              {currentGradeName} • {currentSubjectName}
            </Text>
          </View>

          {/* CHAPTER SELECTION SECTION */}
          <View style={styles.chapterHeaderRow}>
            <Text style={styles.sectionTitle}>Select Chapters</Text>
            <Text style={styles.chapterStatus}>
              {selectedChapters.length === 0
                ? "Full Book (SLO Mode)"
                : `${selectedChapters.length} Selected`}
            </Text>
          </View>

          {isFetchingChapters ? (
            <ActivityIndicator color="#1B5E20" style={{ marginBottom: 20 }} />
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
                      {/* Shorten the name to just the Unit for a cleaner UI if you prefer */}
                      {chapterName.split(":")[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={styles.sectionTitle}>Question Type</Text>
          <View style={styles.typeContainer}>
            {["MCQ", "SHORT", "LONG"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeCard,
                  questionType === type && styles.typeCardActive,
                ]}
                onPress={() => setQuestionType(type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.typeText,
                    questionType === type && styles.typeTextActive,
                  ]}
                >
                  {type === "MCQ"
                    ? "MCQs"
                    : type === "SHORT"
                      ? "Short Qs"
                      : "Long Qs"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Number of Questions</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setNumQuestions(Math.max(1, numQuestions - 1))}
            >
              <Text style={styles.stepperBtnText}>-</Text>
            </TouchableOpacity>

            <View style={styles.stepperValueContainer}>
              <Text style={styles.stepperValue}>{numQuestions}</Text>
            </View>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setNumQuestions(Math.min(50, numQuestions + 1))}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.generateBtn,
              isLoading && styles.generateBtnDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleGenerate}
            disabled={isLoading}
          >
            <LinearGradient
              colors={
                isLoading ? ["#81C784", "#A5D6A7"] : ["#2E7D32", "#1B5E20"]
              }
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.btnText}>Generating via Gemini...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.btnIcon}>✨</Text>
                  <Text style={styles.btnText}>Generate Exam Paper</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { padding: 20 },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#1B5E20",
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryValue: { fontSize: 18, fontWeight: "bold", color: "#1B5E20" },

  // New Styles for Chapters
  chapterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 5,
  },
  chapterStatus: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2E7D32",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 25,
  },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#1B5E20",
  },
  chipText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },
  noChaptersText: {
    fontStyle: "italic",
    color: "#666",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  typeCard: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  typeCardActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#1B5E20",
    elevation: 4,
  },
  typeText: { fontSize: 14, fontWeight: "600", color: "#2E7D32" },
  typeTextActive: { color: "#fff" },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 40,
    elevation: 2,
  },
  stepperBtn: {
    backgroundColor: "#E8F5E9",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperBtnText: { fontSize: 24, color: "#1B5E20", fontWeight: "bold" },
  stepperValueContainer: { flex: 1, alignItems: "center" },
  stepperValue: { fontSize: 32, fontWeight: "bold", color: "#1B5E20" },
  generateBtn: { borderRadius: 30, overflow: "hidden", elevation: 5 },
  generateBtnDisabled: { elevation: 0 },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  btnIcon: { fontSize: 20, marginRight: 8 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
