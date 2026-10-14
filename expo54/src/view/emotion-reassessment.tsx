import { Emotion } from "@/src/model/thought";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmotionDeltaBadge } from "./emotion-badge";
import { IntensitySlider } from "./intensity-slider";

export interface EmotionReassessmentProps {
  emotions: Emotion[];
  onChange: (emotions: Emotion[]) => void;
  textColor?: string;
  isDark?: boolean;
  translate: (key: any) => string;
}

export function EmotionReassessment({
  emotions,
  onChange,
  textColor = "#000",
  isDark = false,
  translate: t,
}: EmotionReassessmentProps) {
  if (!emotions || emotions.length === 0) {
    return null;
  }

  const handleUpdateReassessed = (index: number, newIntensity: number) => {
    const updated = [...emotions];
    updated[index] = {
      ...updated[index],
      reassessedIntensity: newIntensity,
    };
    onChange(updated);
  };

  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
  const cardBg = isDark ? "rgba(255,255,255,0.08)" : "#f8f9fc";

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>
        {t("cbt_form.reassessed_emotions") || "Reassess Emotions"}:
      </Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        {t("cbt_form.reassessed_emotions_desc") ||
          "How intense are these emotions now after reframing your thoughts?"}
      </Text>

      {emotions.map((item, index) => {
        const reassessed =
          item.reassessedIntensity !== undefined
            ? item.reassessedIntensity
            : item.intensity;

        return (
          <View
            key={`${item.name}-${index}`}
            style={[styles.itemCard, { backgroundColor: cardBg, borderColor }]}
          >
            <View style={styles.headerRow}>
              <Text style={[styles.itemName, { color: textColor }]}>
                {item.name}
              </Text>
              <EmotionDeltaBadge
                emotion={{ ...item, reassessedIntensity: reassessed }}
                isDark={isDark}
              />
            </View>

            <IntensitySlider
              value={reassessed}
              onChange={(val) => handleUpdateReassessed(index, val)}
              textColor={textColor}
              isDark={isDark}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    width: "100%",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 10,
  },
  itemCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
});
