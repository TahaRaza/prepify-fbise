import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
// import { LinearGradient } from "expo-linear-gradient";

export default function GeneratorScreen() {
  const { classId, subject } = useLocalSearchParams();
  const [qType, setQType] = useState("MCQ");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const formats = [
    { id: "MCQ", label: "Multiple Choice (MCQs)", icon: "🎯" },
    { id: "Short", label: "Short Questions", icon: "📝" },
    { id: "Long", label: "Long / Theory Questions", icon: "📜" },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Replace with your actual local IP (not localhost if using physical device)
      const response = await fetch("http://192.168.20.98:8000/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: `Class ${classId}`,
          subject: subject,
          q_type: qType,
        }),
      });
      const data = await response.json();
      setResult(data.questions); // This will be the AI output
    } catch (error) {
      alert("Make sure your FastAPI server is running!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Examination Format</Text>
        <Text style={styles.subHeading}>
          Select the type of questions to generate for FBISE 2026 SLO standards.
        </Text>

        {formats.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.typeCard, qType === item.id && styles.activeCard]}
            onPress={() => setQType(item.id)}
          >
            <Text style={styles.iconText}>{item.icon}</Text>
            <Text
              style={[styles.typeLabel, qType === item.id && styles.activeText]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.mainBtn}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>🚀 Generate Questions</Text>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Generated Content:</Text>
            <Text style={styles.resultText}>
              {JSON.stringify(result, null, 2)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E9" },
  scroll: { padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", color: "#1B5E20" },
  subHeading: { fontSize: 14, color: "#666", marginBottom: 25, marginTop: 5 },
  typeCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },
  activeCard: {
    backgroundColor: "#1B5E20",
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  iconText: { fontSize: 24, marginRight: 15 },
  typeLabel: { fontSize: 18, fontWeight: "600", color: "#333" },
  activeText: { color: "#fff" },
  mainBtn: {
    backgroundColor: "#2E7D32",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  resultBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resultTitle: { fontWeight: "bold", marginBottom: 10 },
  resultText: { fontFamily: "monospace", fontSize: 12 },
});
