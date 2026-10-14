import { Emotion, Thought, getEmotionSuggestions } from "@/src/model/thought";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IntensitySlider } from "./intensity-slider";

export interface EmotionEditorProps {
  emotions: Emotion[];
  onChange: (emotions: Emotion[]) => void;
  allThoughts: Iterable<Thought>;
  textColor?: string;
  isDark?: boolean;
  translate: (key: any) => string;
}

export function EmotionEditor({
  emotions,
  onChange,
  allThoughts,
  textColor = "#000",
  isDark = false,
  translate: t,
}: EmotionEditorProps) {
  const [emotionName, setEmotionName] = useState("");
  const [currentIntensity, setCurrentIntensity] = useState(70);

  const activeNames = useMemo(() => emotions.map((e) => e.name), [emotions]);
  const suggestions = useMemo(
    () =>
      getEmotionSuggestions(
        allThoughts,
        [],
        emotionName,
        activeNames
      ).slice(0, 8),
    [allThoughts, emotionName, activeNames]
  );

  const handleAddEmotion = (nameToAdd?: string) => {
    const finalName = (nameToAdd || emotionName).trim();
    if (!finalName) return;

    // If already exists, update its intensity
    const existingIndex = emotions.findIndex(
      (e) => e.name.toLowerCase() === finalName.toLowerCase()
    );
    if (existingIndex >= 0) {
      const updated = [...emotions];
      updated[existingIndex] = {
        ...updated[existingIndex],
        intensity: currentIntensity,
      };
      onChange(updated);
    } else {
      onChange([
        ...emotions,
        {
          name: finalName,
          intensity: currentIntensity,
        },
      ]);
    }
    setEmotionName("");
    Keyboard.dismiss();
  };

  const handleRemove = (index: number) => {
    const updated = [...emotions];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleUpdateIntensity = (index: number, newIntensity: number) => {
    const updated = [...emotions];
    updated[index] = { ...updated[index], intensity: newIntensity };
    onChange(updated);
  };

  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "#fff";
  const cardBg = isDark ? "rgba(255,255,255,0.08)" : "#f8f9fc";

  return (
    <View style={styles.container}>
      {/* Existing emotions list */}
      {emotions.length > 0 && (
        <View style={styles.list}>
          {emotions.map((item, index) => (
            <View
              key={`${item.name}-${index}`}
              style={[styles.itemCard, { backgroundColor: cardBg, borderColor }]}
            >
              <View style={styles.itemHeader}>
                <Text style={[styles.itemName, { color: textColor }]}>
                  {item.name}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemove(index)}
                  style={styles.removeBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityLabel="Remove emotion"
                >
                  <Text style={[styles.removeBtnText, { color: textColor }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
              <IntensitySlider
                value={item.intensity}
                onChange={(val) => handleUpdateIntensity(index, val)}
                textColor={textColor}
                isDark={isDark}
              />
            </View>
          ))}
        </View>
      )}

      {/* Add new emotion section */}
      <View style={[styles.addCard, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: inputBg,
                borderColor,
                color: textColor,
              },
            ]}
            placeholder={t("cbt_form.emotion_placeholder") || "Add emotion (e.g. Anxiety, Anger)..."}
            placeholderTextColor={isDark ? "#888" : "#999"}
            value={emotionName}
            onChangeText={setEmotionName}
            onSubmitEditing={() => handleAddEmotion()}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addBtn, { opacity: emotionName.trim() ? 1 : 0.6 }]}
            onPress={() => handleAddEmotion()}
            disabled={!emotionName.trim()}
          >
            <Text style={styles.addBtnText}>+ {t("cbt_form.add") || "Add"}</Text>
          </TouchableOpacity>
        </View>

        {/* Real-time suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((sug) => (
              <TouchableOpacity
                key={sug}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor: isDark
                      ? "rgba(84, 109, 229, 0.3)"
                      : "rgba(84, 109, 229, 0.12)",
                    borderColor: "#546de5",
                  },
                ]}
                onPress={() => {
                  setEmotionName(sug);
                  handleAddEmotion(sug);
                }}
              >
                <Text style={styles.suggestionText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.sliderSection}>
          <Text style={[styles.sliderLabel, { color: textColor }]}>
            {t("cbt_form.intensity") || "Intensity"}:
          </Text>
          <IntensitySlider
            value={currentIntensity}
            onChange={setCurrentIntensity}
            textColor={textColor}
            isDark={isDark}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    width: "100%",
  },
  list: {
    marginBottom: 10,
  },
  itemCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  removeBtn: {
    padding: 4,
  },
  removeBtnText: {
    fontSize: 14,
    opacity: 0.6,
  },
  addCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: "#546de5",
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    color: "#546de5",
    fontWeight: "600",
  },
  sliderSection: {
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
});
