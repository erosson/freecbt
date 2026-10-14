import { Emotion, calculateEmotionDelta } from "@/src/model/thought";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface EmotionDeltaBadgeProps {
  emotion: Emotion;
  compact?: boolean;
  isDark?: boolean;
}

export const EmotionDeltaBadge = React.memo(function EmotionDeltaBadge({
  emotion,
  compact = false,
  isDark = false,
}: EmotionDeltaBadgeProps) {
  const delta = calculateEmotionDelta(
    emotion.intensity,
    emotion.reassessedIntensity
  );

  let badgeColor = "#6b7280";
  let bgBadge = isDark ? "rgba(107, 114, 128, 0.25)" : "#f3f4f6";
  let symbol = "—";

  if (delta.direction === "decrease") {
    badgeColor = isDark ? "#34d399" : "#059669";
    bgBadge = isDark ? "rgba(5, 150, 105, 0.25)" : "#ecfdf5";
    symbol = "↓";
  } else if (delta.direction === "increase") {
    badgeColor = isDark ? "#f87171" : "#dc2626";
    bgBadge = isDark ? "rgba(220, 38, 38, 0.25)" : "#fef2f2";
    symbol = "↑";
  }

  const absDiff = Math.abs(delta.diff);

  if (delta.direction === "none") {
    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6" },
        ]}
      >
        <Text style={[styles.emotionName, { color: isDark ? "#fff" : "#111" }]}>
          {emotion.name}
        </Text>
        <Text
          style={[styles.intensityText, { color: isDark ? "#ccc" : "#555" }]}
        >
          {emotion.intensity}%
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgBadge }]}>
      <Text style={[styles.emotionName, { color: isDark ? "#fff" : "#111" }]}>
        {emotion.name}
      </Text>
      {compact ? (
        <Text style={[styles.deltaText, { color: badgeColor }]}>
          {symbol}
          {absDiff}%
        </Text>
      ) : (
        <Text style={[styles.deltaText, { color: badgeColor }]}>
          {emotion.intensity}% → {emotion.reassessedIntensity}% ({symbol}
          {absDiff}%)
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  emotionName: {
    fontSize: 12,
    fontWeight: "700",
    marginRight: 6,
  },
  intensityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deltaText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
