import { Routes } from "@/src";
import { TranslateFn } from "@/src/hooks/use-i18n";
import { Style } from "@/src/hooks/use-style";
import { Distortion, Model, Thought } from "@/src/model";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EmotionDeltaBadge } from "./emotion-badge";

export function formatBlockTime(date: Date, localeStr: string = "en"): string {
  try {
    return date.toLocaleTimeString(localeStr === "ar" ? "ar-EG" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
}

export interface ThoughtCardProps {
  thought: Thought.Thought;
  model: Model.Ready;
  style: Style;
  translate: TranslateFn;
  onDelete?: () => void;
  isDark?: boolean;
  locale?: string;
  showFullDetails?: boolean;
}

export const ThoughtCard = React.memo(function ThoughtCard({
  thought,
  model,
  style: s,
  translate: t,
  onDelete,
  isDark = false,
  locale = "en",
}: ThoughtCardProps) {
  const slugs = new Set(
    Array.from(thought.cognitiveDistortions).map((d) => d.slug)
  );
  const distortions = model.distortionData.list.filter((d) =>
    slugs.has(d.slug)
  );

  const situationTime = formatBlockTime(
    Thought.getBlockTimestamp(thought, "situation"),
    locale
  );
  const autoThoughtTime = formatBlockTime(
    Thought.getBlockTimestamp(thought, "automaticThought"),
    locale
  );
  const distortionsTime = formatBlockTime(
    Thought.getBlockTimestamp(thought, "distortions"),
    locale
  );
  const challengeTime = formatBlockTime(
    Thought.getBlockTimestamp(thought, "challenge"),
    locale
  );
  const altThoughtTime = formatBlockTime(
    Thought.getBlockTimestamp(thought, "alternativeThought"),
    locale
  );

  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";
  const blockBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f9fc";
  const borderColor = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";
  const timeColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const textColor = s.text.color;

  const emotions = thought.emotions ?? [];
  const isFreeNote =
    distortions.length === 0 &&
    !thought.challenge &&
    !thought.alternativeThought;

  const confirmDelete = () => {
    if (!onDelete) return;
    const title = locale === "ar" ? "حذف الفكرة" : "Delete Thought";
    const message =
      locale === "ar"
        ? "هل أنت متأكد من رغبتك في حذف هذه الفكرة؟ لا يمكن التراجع عن هذا الإجراء."
        : "Are you sure you want to delete this thought? This action cannot be undone.";
    const cancelText = locale === "ar" ? "إلغاء" : "Cancel";
    const deleteText = locale === "ar" ? "حذف" : "Delete";

    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm(`${title}\n\n${message}`)
      ) {
        onDelete();
      }
    } else {
      Alert.alert(title, message, [
        { text: cancelText, style: "cancel" },
        { text: deleteText, style: "destructive", onPress: onDelete },
      ]);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      {/* Card Header with Top Actions & Date */}
      <View style={[styles.cardHeader, { borderBottomColor: borderColor }]}>
        <View style={styles.headerDateRow}>
          <Feather name="calendar" size={13} color={timeColor} style={{ marginRight: 5 }} />
          <Text style={[styles.headerDateText, { color: timeColor }]}>
            {thought.createdAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          {isFreeNote && (
            <View
              style={[
                styles.freeNoteBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(84, 109, 229, 0.25)"
                    : "rgba(84, 109, 229, 0.12)",
                },
              ]}
            >
              <Text style={styles.freeNoteBadgeText}>
                ✏️ {t("free_write.badge") || "Free Note"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <Link
            href={Routes.thoughtEditV2(thought.uuid, "automatic-thought")}
            asChild
          >
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#f0f2f8" }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={t("cbt_form.edit") || "Edit"}
            >
              <Feather name="edit-2" size={14} color={textColor} />
            </TouchableOpacity>
          </Link>
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isDark ? "rgba(239,68,68,0.2)" : "#fee2e2" }]}
              onPress={confirmDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={t("accessibility.delete_thought_button") || "Delete"}
            >
              <Feather name="trash-2" size={14} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Prominent Emotion Changes Summary (Requirement 4) */}
      {emotions.length > 0 && (
        <View style={[styles.emotionsSummaryBox, { backgroundColor: blockBg, borderColor }]}>
          <Text style={[styles.emotionsSummaryTitle, { color: textColor }]}>
            {t("cbt_form.reassessed_emotions") || "Emotional Changes"}:
          </Text>
          <View style={styles.emotionsBadgeRow}>
            {emotions.map((em, idx) => (
              <EmotionDeltaBadge
                key={`${em.name}-${idx}`}
                emotion={em}
                isDark={isDark}
                compact={false}
              />
            ))}
          </View>
        </View>
      )}

      {/* Vertically scrollable blocks inside the card (Requirement 2 & 3) */}
      <ScrollView
        style={styles.blocksScroll}
        contentContainerStyle={styles.blocksContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {/* Situation / Title Block */}
        {thought.situation ? (
          <View style={[styles.block, { backgroundColor: blockBg, borderColor }]}>
            <View style={styles.blockHeader}>
              <Text style={[styles.blockTitle, { color: textColor }]}>
                {isFreeNote
                  ? (locale === "ar" ? "العنوان" : "Title")
                  : (t("cbt_form.situation_placeholder") || "Situation")}
              </Text>
              <Text style={[styles.timestamp, { color: timeColor }]}>
                {situationTime}
              </Text>
            </View>
            <Text
              style={[
                styles.blockContent,
                { color: textColor, fontWeight: isFreeNote ? "700" : "normal" },
              ]}
            >
              {thought.situation}
            </Text>
          </View>
        ) : null}

        {/* Automatic Thought / Note Body Block */}
        <View style={[styles.block, { backgroundColor: blockBg, borderColor }]}>
          <View style={styles.blockHeader}>
            <Text style={[styles.blockTitle, { color: textColor }]}>
              {isFreeNote
                ? (t("free_write.header") || "Note")
                : t("auto_thought")}
            </Text>
            <Text style={[styles.timestamp, { color: timeColor }]}>
              {autoThoughtTime}
            </Text>
          </View>
          <Text style={[styles.blockContent, { color: textColor }]}>
            {thought.automaticThought || "—"}
          </Text>
          {emotions.length > 0 && (
            <View style={styles.chipsRow}>
              {emotions.map((em, idx) => (
                <View
                  key={`init-${em.name}-${idx}`}
                  style={[
                    styles.initChip,
                    {
                      backgroundColor: isDark
                        ? "rgba(84, 109, 229, 0.25)"
                        : "rgba(84, 109, 229, 0.1)",
                    },
                  ]}
                >
                  <Text style={styles.initChipText}>
                    {em.name}: {em.intensity}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {!isFreeNote && (
          <>
            {/* Cognitive Distortions Block */}
            <View style={[styles.block, { backgroundColor: blockBg, borderColor }]}>
              <View style={styles.blockHeader}>
                <Text style={[styles.blockTitle, { color: textColor }]}>
                  {t("cog_distortion")}
                </Text>
                <Text style={[styles.timestamp, { color: timeColor }]}>
                  {distortionsTime}
                </Text>
              </View>
              {distortions.length > 0 ? (
                <View style={styles.chipsRow}>
                  {distortions.map((d) => (
                    <View
                      key={d.slug}
                      style={[
                        styles.distortionBadge,
                        {
                          backgroundColor: isDark
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.05)",
                        },
                      ]}
                    >
                      <Text style={[styles.distortionText, { color: textColor }]}>
                        {Distortion.emoji(d)} {t(d.labelKey)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.blockContent, { color: timeColor }]}>—</Text>
              )}
            </View>

            {/* Challenge Block */}
            <View style={[styles.block, { backgroundColor: blockBg, borderColor }]}>
              <View style={styles.blockHeader}>
                <Text style={[styles.blockTitle, { color: textColor }]}>
                  {t("challenge")}
                </Text>
                <Text style={[styles.timestamp, { color: timeColor }]}>
                  {challengeTime}
                </Text>
              </View>
              <Text style={[styles.blockContent, { color: textColor }]}>
                {thought.challenge || "—"}
              </Text>
            </View>

            {/* Alternative Thought Block */}
            <View style={[styles.block, { backgroundColor: blockBg, borderColor }]}>
              <View style={styles.blockHeader}>
                <Text style={[styles.blockTitle, { color: textColor }]}>
                  {t("alt_thought")}
                </Text>
                <Text style={[styles.timestamp, { color: timeColor }]}>
                  {altThoughtTime}
                </Text>
              </View>
              <Text style={[styles.blockContent, { color: textColor }]}>
                {thought.alternativeThought || "—"}
              </Text>
              {emotions.some((e) => e.reassessedIntensity !== undefined) && (
                <View style={styles.chipsRow}>
                  {emotions.map((em, idx) => (
                    <EmotionDeltaBadge
                      key={`alt-${em.name}-${idx}`}
                      emotion={em}
                      isDark={isDark}
                      compact={false}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerDateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerDateText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emotionsSummaryBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  emotionsSummaryTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  emotionsBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  blocksScroll: {
    flex: 1,
    marginTop: 10,
  },
  blocksContainer: {
    paddingBottom: 20,
    gap: 10,
  },
  block: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  blockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  timestamp: {
    fontSize: 11,
    fontWeight: "500",
  },
  blockContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  initChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  initChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#546de5",
  },
  distortionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distortionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  freeNoteBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freeNoteBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#546de5",
  },
});
