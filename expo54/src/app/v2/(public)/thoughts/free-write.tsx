import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, Model } from "@/src/model";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FreeWriteScreen() {
  return <LoadModel ready={Ready} />;
}

function Ready({ model, dispatch, style: s, translate: t }: ModelLoadedProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDark =
    model.settings.theme === "dark" ||
    (model.settings.theme === null && model.deviceColorScheme === "dark");
  const locale = Model.locale(model);
  const isRtl = locale === "ar" || locale === "fa";

  const textColor = s.text.color;
  const borderColor = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#fafbfc";
  const mutedText = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const primaryColor = "#546de5";

  // Fast O(1) live counters
  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [content]);

  const charCount = content.length;

  const now = useMemo(() => new Date(), []);
  const formattedDate = useMemo(() => {
    try {
      return now.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return now.toDateString();
    }
  }, [now, locale]);

  const formattedTime = useMemo(() => {
    try {
      return now.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
  }, [now, locale]);

  const handleSave = useCallback(() => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      const emptyMsg =
        locale === "ar"
          ? "يرجى كتابة نص التدوينة أولاً."
          : "Please write some text before saving.";
      if (Platform.OS === "web") {
        alert(emptyMsg);
      } else {
        Alert.alert(locale === "ar" ? "تنبيه" : "Notice", emptyMsg);
      }
      return;
    }

    setIsSubmitting(true);
    const saveDate = new Date();
    const saveIso = saveDate.toISOString();
    const finalTitle =
      title.trim() ||
      (locale === "ar" ? "تدوين حر" : "Free Writing");

    dispatch(
      Action.createThought(
        {
          situation: finalTitle,
          automaticThought: trimmedContent,
          cognitiveDistortions: new Set(),
          challenge: "",
          alternativeThought: "",
          emotions: [],
          blockTimestamps: {
            situation: saveIso,
            automaticThought: saveIso,
          },
        },
        saveDate
      )
    );
  }, [title, content, locale, dispatch]);

  const handleBack = useCallback(() => {
    if (content.trim()) {
      const confirmMsg =
        locale === "ar"
          ? "لديك نص غير محفوظ، هل أنت متأكد من رغبتك بالرجوع؟"
          : "You have unsaved changes. Are you sure you want to go back?";
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.confirm(confirmMsg)) {
          router.navigate(Routes.thoughtListV2());
        }
      } else {
        Alert.alert(
          locale === "ar" ? "تنبيه" : "Notice",
          confirmMsg,
          [
            { text: locale === "ar" ? "إلغاء" : "Cancel", style: "cancel" },
            {
              text: locale === "ar" ? "نعم، رجوع" : "Yes, Go Back",
              style: "destructive",
              onPress: () => router.navigate(Routes.thoughtListV2()),
            },
          ]
        );
      }
    } else {
      router.navigate(Routes.thoughtListV2());
    }
  }, [content, locale, router]);

  return (
    <SafeAreaView style={[s.view, styles.safeArea]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <View style={[s.container, styles.mainContainer]}>
          {/* Top Header Bar */}
          <View style={[styles.topBar, isRtl && styles.rowReverse]}>
            <TouchableOpacity
              onPress={handleBack}
              style={[styles.backBtn, isRtl && styles.rowReverse]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name={isRtl ? "arrow-right" : "arrow-left"}
                size={20}
                color={textColor}
              />
              <Text style={[styles.backBtnText, { color: textColor }]}>
                {locale === "ar" ? "العودة" : "Back"}
              </Text>
            </TouchableOpacity>

            {/* Live Date / Time Badge */}
            <View style={[styles.dateBadge, { borderColor }]}>
              <Feather name="clock" size={13} color={mutedText} style={{ marginHorizontal: 4 }} />
              <Text style={[styles.dateText, { color: mutedText }]}>
                {formattedDate} • {formattedTime}
              </Text>
            </View>
          </View>

          {/* Editor Container Card */}
          <ScrollView
            style={styles.editorScroll}
            contentContainerStyle={styles.editorContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              {/* Title Input */}
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    color: textColor,
                    backgroundColor: inputBg,
                    borderColor,
                    textAlign: isRtl ? "right" : "left",
                  },
                ]}
                placeholder={t("free_write.title_placeholder") || "Title (optional)..."}
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                returnKeyType="next"
              />

              {/* Free Text Body Input */}
              <TextInput
                style={[
                  styles.bodyInput,
                  {
                    color: textColor,
                    backgroundColor: inputBg,
                    borderColor,
                    textAlign: isRtl ? "right" : "left",
                  },
                ]}
                placeholder={
                  t("free_write.body_placeholder") ||
                  "Write freely without constraints — your thoughts, feelings, or notes..."
                }
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={content}
                onChangeText={setContent}
                multiline={true}
                numberOfLines={10}
                textAlignVertical="top"
                autoFocus={true}
              />

              {/* Bottom Info Bar: Word/Char Counters & Save Button */}
              <View style={[styles.bottomBar, isRtl && styles.rowReverse]}>
                <View style={[styles.countersRow, isRtl && styles.rowReverse]}>
                  <View style={[styles.counterChip, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
                    <Text style={[styles.counterText, { color: mutedText }]}>
                      {wordCount} {t("free_write.words") || "words"}
                    </Text>
                  </View>
                  <View style={[styles.counterChip, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
                    <Text style={[styles.counterText, { color: mutedText }]}>
                      {charCount} {t("free_write.chars") || "chars"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    {
                      backgroundColor: primaryColor,
                      opacity: content.trim() && !isSubmitting ? 1 : 0.6,
                    },
                  ]}
                  onPress={handleSave}
                  disabled={!content.trim() || isSubmitting}
                >
                  <Feather name="check" size={16} color="#fff" style={{ marginRight: isRtl ? 0 : 6, marginLeft: isRtl ? 6 : 0 }} />
                  <Text style={styles.saveBtnText}>
                    {t("free_write.save") || "Save Entry"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    width: "100%",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
  },
  editorScroll: {
    flex: 1,
  },
  editorContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  titleInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  bodyInput: {
    minHeight: 260,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 14,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 6,
  },
  countersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  counterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  counterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#546de5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
