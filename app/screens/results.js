import * as Print from "expo-print";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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
import MathJax from "react-native-mathjax";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { supabase } from "../../supabaseClient";

// THE FIX: Passed 'colors' and 'theme' props so the WebView adapts perfectly to Dark Mode
const MathRenderer = ({ content, colors, theme }) => {
  const mmlOptions = {
    messageStyle: "none",
    extensions: ["tex2jax.js"],
    jax: ["input/TeX", "output/HTML-CSS"],
    tex2jax: {
      inlineMath: [
        ["\\(", "\\)"],
        ["$", "$"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
      processEscapes: true,
      processEnvironments: true,
    },
    TeX: {
      extensions: [
        "AMSmath.js",
        "AMSsymbols.js",
        "noErrors.js",
        "noUndefined.js",
      ],
    },
  };

  const safeContent = content
    ? String(content)
        .replace(
          /\\n(?!eq|otin|exists|abla|u\b|Rightarrow|rightarrow)/g,
          "<br/>",
        )
        .replace(/\\text\{\s*\\\((.*?)\\\)\s*\}/g, "\\text{$1}")
        .replace(/\\text\{\s*\$(.*?)\$\s*\}/g, "\\text{$1}")
        .trim()
    : "";

  const formattedContent = safeContent
    .replace(/`{2,3}(\w*)\n([\s\S]*?)`{2,3}/g, (match, language, code) => {
      const bg = theme === "dark" ? "#2D2D2D" : "#F4F4F4";
      return `<pre style="background-color: ${bg}; color: ${colors.textPrimary}; padding: 12px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto; margin: 10px 0; white-space: pre;"><code>${code.trim()}</code></pre>`;
    })
    .replace(
      /`([^`]+)`/g,
      `<code style="background-color: ${colors.background}; color: ${colors.accent}; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 14px;">$1</code>`,
    )
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // THE FIX: Explicitly set background-color to colors.card and force table data (td) to use colors.textPrimary
  const htmlContent = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: ${colors.card} !important; 
        display: table; 
        width: 100%;
      }
      .math-wrapper {
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 16px;
        color: ${colors.textPrimary} !important; 
        line-height: 1.5;
        white-space: pre-wrap; 
        word-wrap: break-word;
      }
      td {
        color: ${colors.textPrimary} !important;
      }
      .MathJax, .MathJax_Display {
        margin: 0 !important;
        padding: 0 !important;
      }
      .MathJax_Display {
        overflow-x: auto;
        overflow-y: hidden;
        padding-bottom: 2px; 
      }
      #MathJax_Message {
        display: none !important;
      }
    </style>
    <div class="math-wrapper">${formattedContent}</div>
  `;

  return (
    <View
      style={{
        minHeight: 30,
        marginBottom: 5,
        backgroundColor: colors.card,
        opacity: 0.99,
        overflow: "hidden",
      }}
    >
      <MathJax mathJaxOptions={mmlOptions} html={htmlContent} />
    </View>
  );
};

export default function ResultsScreen() {
  const { examData, title, gradeName, subjectName, questionType } =
    useLocalSearchParams();

  // --- Theme Setup ---
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const styles = createStyles(colors);

  let parsedData = {};
  let questions = [];

  try {
    parsedData = examData ? JSON.parse(examData) : {};

    if (parsedData.data && Array.isArray(parsedData.data)) {
      questions = parsedData.data;
    } else if (parsedData.mcqs || parsedData.shorts || parsedData.longs) {
      questions = [
        ...(parsedData.mcqs || []),
        ...(parsedData.shorts || []),
        ...(parsedData.longs || []),
      ];
    }
  } catch (error) {
    console.error("Failed to parse examData:", error);
    questions = [];
  }

  const [expandedId, setExpandedId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [chaptersMap, setChaptersMap] = useState({ toDbId: {}, toUnitNum: {} });

  React.useEffect(() => {
    const fetchChaptersMap = async () => {
      if (!gradeName || !subjectName) return;

      const { data: gradeData } = await supabase
        .from("grades")
        .select("id")
        .eq("name", gradeName)
        .single();
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", subjectName)
        .single();

      if (gradeData && subjectData) {
        const { data: chaptersData } = await supabase
          .from("chapters")
          .select("id, name")
          .eq("grade_id", gradeData.id)
          .eq("subject_id", subjectData.id);

        if (chaptersData) {
          const toDbId = {};
          const toUnitNum = {};

          chaptersData.forEach((ch) => {
            const match = ch.name.match(/Unit\s+(\d+)/i);
            if (match) {
              const unitNum = parseInt(match[1], 10);
              toDbId[unitNum] = ch.id;
              toUnitNum[ch.id] = unitNum;
            }
          });
          setChaptersMap({ toDbId, toUnitNum });
        }
      }
    };

    fetchChaptersMap();
  }, [gradeName, subjectName]);

  const toggleExpand = (index) =>
    setExpandedId(expandedId === index ? null : index);

  const handleSavePaper = async () => {
    if (isSaved) return;

    setIsSaving(true);
    try {
      const { data: gradeData } = await supabase
        .from("grades")
        .select("id")
        .eq("name", gradeName)
        .single();
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", subjectName)
        .single();

      if (!gradeData || !subjectData) {
        Alert.alert("Error", "Could not resolve Grade or Subject IDs.");
        setIsSaving(false);
        return;
      }

      const { data: chaptersData } = await supabase
        .from("chapters")
        .select("id, name")
        .eq("grade_id", gradeData.id)
        .eq("subject_id", subjectData.id);

      const unitToDbIdMap = {};
      if (chaptersData) {
        chaptersData.forEach((ch) => {
          const match = ch.name.match(/Unit\s+(\d+)/i);
          if (match) {
            const unitNum = parseInt(match[1], 10);
            unitToDbIdMap[unitNum] = ch.id;
          }
        });
      }

      const formattedQuestions = questions.map((q) => ({
        grade_id: gradeData.id,
        subject_id: subjectData.id,
        chapter_id: unitToDbIdMap[q.chapter_id] || null,
        question_type: q.question_type || questionType,
        difficulty: q.difficulty,
        question_text: q.question_text,
        options: q.options || null,
        correct_answer: q.correct_answer || null,
        explanation: q.explanation || null,
        marks: q.marks || null,
        is_active: true,
      }));

      const { error } = await supabase
        .from("questions")
        .insert(formattedQuestions);

      if (error) {
        console.error("Insert Error:", error);
        Alert.alert("Save Failed", error.message);
      } else {
        setIsSaved(true);
        Alert.alert("Success! 🎉", "Paper has been successfully saved.");
      }
    } catch (error) {
      console.error("Save Exception:", error);
      Alert.alert("Error", "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    try {
      const mcqs = questions.filter((q) => q.question_type === "MCQ");
      const shortQs = questions.filter((q) => q.question_type === "SHORT");
      const longQs = questions.filter((q) => q.question_type === "LONG");

      const formatMathForPDF = (str) => {
        if (!str) return "";

        let parsed = String(str)
          .replace(/\\"/g, '"')
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        const unescapeHTML = (mathStr) => {
          return mathStr
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");
        };

        parsed = parsed.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
          const encoded = encodeURIComponent(unescapeHTML(math.trim()));
          return `<div style="text-align: center; margin: 10px 0;"><img src="https://latex.codecogs.com/svg.image?\\dpi{300}\\bg{white}${encoded}" style="max-width: 100%;" /></div>`;
        });

        parsed = parsed.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
          const encoded = encodeURIComponent(unescapeHTML(math.trim()));
          return `<div style="text-align: center; margin: 10px 0;"><img src="https://latex.codecogs.com/svg.image?\\dpi{300}\\bg{white}${encoded}" style="max-width: 100%;" /></div>`;
        });

        parsed = parsed.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
          const encoded = encodeURIComponent(unescapeHTML(math.trim()));
          return `<img src="https://latex.codecogs.com/svg.image?\\dpi{300}\\bg{white}\\inline&space;${encoded}" style="vertical-align: middle; max-width: 100%;" />`;
        });

        return parsed;
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Times New Roman', Times, serif; padding: 20px; color: #000; line-height: 1.4; font-size: 14px; background-color: white;}
              .header-title { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin-bottom: 20px; text-transform: uppercase; }
              .meta-info { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 15px; }
              .section-title { text-align: center; font-size: 16px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-decoration: underline; }
              .instructions { font-size: 13px; font-style: italic; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 8px 0; margin-bottom: 15px; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: middle; }
              th { background-color: #f2f2f2; font-weight: bold; }
              
              .option-grid { display: flex; flex-wrap: wrap; margin-top: 5px; }
              .option-item { width: 50%; margin-bottom: 8px; display: flex; align-items: flex-start; }
              .option-key { font-weight: bold; margin-right: 8px; margin-top: 2px; }
              
              .q-block { margin-bottom: 15px; display: flex; }
              .q-num { font-weight: bold; margin-right: 10px; white-space: nowrap; }
              .q-text { flex: 1; }
              
              .page-break { page-break-before: always; }
            </style>
          </head>
          <body>
            
            <div class="header-title">Federal Board SSC Examination: ${subjectName || "Science/Math"}</div>
            
            <div class="meta-info">
              <span>Roll No: __________________</span>
              <span>Answer Sheet No: __________________</span>
            </div>
            <div class="meta-info">
              <span>Sig. of Candidate: __________________</span>
              <span>Sig. of Invigilator: __________________</span>
            </div>

            <div class="section-title">SECTION – A (Marks 15)</div>
            <div class="meta-info" style="font-weight: normal; margin-bottom: 5px;">
              <span><strong>Time allowed: 20 Minutes</strong></span>
            </div>
            <div class="instructions">
              <strong>Note:</strong> Section-A is compulsory. All parts of this section are to be answered on the question paper itself. It should be completed in the first 20 minutes and handed over to the Centre Superintendent. Deleting/overwriting is not allowed. Do not use lead pencil.
            </div>
            
            <div style="margin-bottom: 10px;">
              <strong>Q.1 Circle the correct option i.e. A / B / C / D. Each part carries one mark.</strong>
            </div>
            
            <table>
              <tr>
                <th style="width: 5%; text-align: center;">Sr.</th>
                <th style="width: 95%;">Questions</th>
              </tr>
              ${mcqs
                .map((q, i) => {
                  let optionsHtml = '<div class="option-grid">';
                  if (q.options) {
                    q.options.forEach((opt, optIdx) => {
                      const key =
                        opt.option_key || String.fromCharCode(65 + optIdx);
                      const rawText = opt.option_text
                        ? String(opt.option_text)
                        : String(opt);

                      optionsHtml += `
                      <div class="option-item">
                        <span class="option-key">${key}.</span>
                        <div>${formatMathForPDF(rawText)}</div>
                      </div>`;
                    });
                  }
                  optionsHtml += "</div>";

                  return `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${i + 1}</td>
                  <td>
                    <div style="margin-bottom: 8px;">${formatMathForPDF(q.question_text)}</div>
                    ${optionsHtml}
                  </td>
                </tr>
                `;
                })
                .join("")}
            </table>

            <div class="page-break"></div>
            
            <div class="header-title">Federal Board SSC Examination: ${subjectName || "Science/Math"}</div>
            
            <div class="meta-info" style="margin-bottom: 5px;">
              <span><strong>Time allowed: 2.40 Hours</strong></span>
              <span><strong>Total Marks: 60</strong></span>
            </div>
            <div class="instructions">
              <strong>Note:</strong> Answer any NINE parts from Section ‘B’ and any THREE questions from Section ‘C’ on the separately provided answer book. Use supplementary answer sheet i.e. Sheet-B if required. Write your answers neatly and legibly.
            </div>

            <div class="section-title">SECTION – B (Marks 36)</div>
            <div style="margin-bottom: 15px;">
              <strong>Q.2 Attempt any NINE parts. The answer to each part should not exceed 3 to 4 lines. (9 × 4 = 36)</strong>
            </div>
            
            <div style="padding-left: 10px;">
              ${shortQs
                .map((q, i) => {
                  const roman = [
                    "i",
                    "ii",
                    "iii",
                    "iv",
                    "v",
                    "vi",
                    "vii",
                    "viii",
                    "ix",
                    "x",
                    "xi",
                    "xii",
                    "xiii",
                    "xiv",
                  ];
                  return `
                <div class="q-block">
                  <div class="q-num">(${roman[i] || i + 1})</div>
                  <div class="q-text">${formatMathForPDF(q.question_text)}</div>
                </div>
              `;
                })
                .join("")}
            </div>

            <div class="section-title" style="margin-top: 30px;">SECTION – C (Marks 24)</div>
            <div style="margin-bottom: 15px;">
              <strong>Note: Attempt any THREE questions. All questions carry equal marks. (3 × 8 = 24)</strong>
            </div>
            
            <div style="padding-left: 10px;">
              ${longQs
                .map(
                  (q, i) => `
                <div class="q-block">
                  <div class="q-num">Q.${i + 3}</div>
                  <div class="q-text">${formatMathForPDF(q.question_text)}</div>
                </div>
              `,
                )
                .join("")}
            </div>

          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack.Screen
        options={{
          title: title || "Generated Paper",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.questionCount}>{questions.length} Questions</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* PDF BUTTON */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              onPress={generatePDF}
            >
              <Text style={styles.saveBtnText}>📄 Export PDF</Text>
            </TouchableOpacity>

            {/* Existing Save Button */}
            {questionType !== "MIXED" && (
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  isSaving && { backgroundColor: colors.border },
                  isSaved && {
                    backgroundColor: colors.achievement,
                    elevation: 0,
                  },
                ]}
                onPress={handleSavePaper}
                disabled={isSaving || isSaved}
              >
                {isSaving ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primaryBtnText}
                  />
                ) : isSaved ? (
                  <Text
                    style={[
                      styles.saveBtnText,
                      { color: colors.primaryBtnText },
                    ]}
                  >
                    ✅ Saved
                  </Text>
                ) : (
                  <Text style={styles.saveBtnText}>💾 Save</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {questions.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
              No questions available.
            </Text>
          </View>
        ) : (
          questions.map((q, index) => {
            let combinedContent = q.question_text
              ? String(q.question_text).replace(/\\"/g, '"').trim()
              : "";

            if (q.options && q.options.length > 0) {
              combinedContent += `<table style="margin-top: 15px; margin-left: 5px; width: 100%; border-collapse: collapse; border: none;">`;

              q.options.forEach((opt, optIndex) => {
                const key = opt.option_key
                  ? String(opt.option_key).trim()
                  : String.fromCharCode(65 + optIndex);

                const text = opt.option_text
                  ? String(opt.option_text).replace(/\\"/g, '"').trim()
                  : String(opt).replace(/\\"/g, '"').trim();

                // Dynamic colors for options table
                combinedContent += `<tr><td style="vertical-align: top; padding-right: 8px; padding-bottom: 8px; font-weight: bold; color: ${colors.accent}; white-space: nowrap; width: 1%;">${key}.</td><td style="vertical-align: top; padding-bottom: 8px;">${text}</td></tr>`;
              });

              combinedContent += `</table>`;
            }

            return (
              <View key={index} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.badgeContainer}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Q{index + 1}</Text>
                    </View>

                    {q.chapter_id && (
                      <View style={styles.unitBadge}>
                        <Text style={styles.unitBadgeText}>
                          Unit{" "}
                          {chaptersMap.toUnitNum[q.chapter_id] || q.chapter_id}
                        </Text>
                      </View>
                    )}

                    {questionType === "MIXED" && q.question_type && (
                      <View
                        style={[
                          styles.unitBadge,
                          { backgroundColor: colors.achievement },
                        ]}
                      >
                        <Text
                          style={[
                            styles.unitBadgeText,
                            { color: colors.primaryBtnText },
                          ]}
                        >
                          {q.question_type}
                        </Text>
                      </View>
                    )}
                  </View>

                  {q.marks && (
                    <Text style={styles.marksText}>[{q.marks} Marks]</Text>
                  )}
                </View>

                {/* PASSING COLORS & THEME DOWN */}
                <MathRenderer
                  content={combinedContent}
                  colors={colors}
                  theme={theme}
                />

                {(q.correct_answer || q.explanation) && (
                  <>
                    <TouchableOpacity
                      style={styles.toggleBtn}
                      onPress={() => toggleExpand(index)}
                    >
                      <Text style={styles.toggleBtnText}>
                        {expandedId === index
                          ? "Hide Answer & Rubric"
                          : "Show Answer & Rubric"}
                      </Text>
                    </TouchableOpacity>

                    {expandedId === index && (
                      <View style={styles.answerContainer}>
                        {q.correct_answer && (
                          <>
                            <Text style={styles.answerLabel}>
                              Correct Answer:
                            </Text>
                            <MathRenderer
                              content={q.correct_answer}
                              colors={colors}
                              theme={theme}
                            />
                          </>
                        )}
                        {q.explanation && (
                          <>
                            <Text style={styles.rubricLabel}>
                              Explanation / Rubric:
                            </Text>
                            <MathRenderer
                              content={q.explanation}
                              colors={colors}
                              theme={theme}
                            />
                          </>
                        )}
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          })
        )}
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
      padding: 15,
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    questionCount: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    saveBtn: {
      backgroundColor: colors.primaryBtn,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      elevation: 2,
      justifyContent: "center",
    },
    saveBtnText: {
      alignSelf: "center",
      color: colors.primaryBtnText,
      fontWeight: "bold",
      fontSize: 14,
    },
    questionCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      elevation: 3,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    questionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    badgeContainer: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    unitBadge: {
      backgroundColor: colors.background, // Sinks into the card slightly
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    unitBadgeText: {
      color: colors.accent,
      fontWeight: "bold",
      fontSize: 12,
    },
    badge: {
      backgroundColor: colors.accent,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
    },
    marksText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    toggleBtn: {
      marginTop: 15,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: "center",
    },
    toggleBtnText: {
      color: colors.accent,
      fontWeight: "600",
      fontSize: 14,
    },
    answerContainer: {
      marginTop: 10,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    answerLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.accent,
      marginBottom: 4,
    },
    rubricLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginTop: 12,
      marginBottom: 4,
    },
  });
