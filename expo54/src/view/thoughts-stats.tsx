import { TranslateFn } from "@/src/hooks/use-i18n";
import { Style } from "@/src/hooks/use-style";
import { Distortion, Model, Thought } from "@/src/model";
import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface ThoughtsStatsProps {
  model: Model.Ready;
  style: Style;
  translate: TranslateFn;
  isDark: boolean;
  locale: string;
}

export function ThoughtsStats({
  model,
  style: s,
  translate: t,
  isDark,
  locale,
}: ThoughtsStatsProps) {
  const isRtl = locale === "ar" || locale === "fa";
  const allThoughts = useMemo(() => Model.thoughtsList(model), [model]);

  // Date helper
  const toLocalDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  // 1. Consistency & Streak Calculations
  const { streak, thoughtsThisWeek, weekDays } = useMemo(() => {
    const activeDaysSet = new Set(
      allThoughts.map((th) => toLocalDateKey(new Date(th.createdAt)))
    );

    const todayDate = new Date();
    const todayKey = toLocalDateKey(todayDate);

    let currentStreak = 0;
    const checkDate = new Date(todayDate);

    // If no entry today, check if yesterday had an entry to preserve current streak
    if (!activeDaysSet.has(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (activeDaysSet.has(toLocalDateKey(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 7-day mini habit tracker (from 6 days ago to today)
    const arDays = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
    const enDays = ["S", "M", "T", "W", "T", "F", "S"];
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toLocalDateKey(d);
      const dayIdx = d.getDay();
      days.push({
        dateKey: key,
        dayName: isRtl ? arDays[dayIdx] : enDays[dayIdx],
        active: activeDaysSet.has(key),
        isToday: i === 0,
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thisWeekCount = allThoughts.filter(
      (th) => new Date(th.createdAt) >= sevenDaysAgo
    ).length;

    return {
      streak: currentStreak,
      thoughtsThisWeek: thisWeekCount,
      weekDays: days,
    };
  }, [allThoughts, isRtl]);

  // 2. Emotional Relief Rate Calculations
  const reliefStats = useMemo(() => {
    let totalInitial = 0;
    let totalReassessed = 0;
    let count = 0;

    for (const thought of allThoughts) {
      if (thought.emotions) {
        for (const em of thought.emotions) {
          if (typeof em.reassessedIntensity === "number") {
            totalInitial += em.intensity;
            totalReassessed += em.reassessedIntensity;
            count++;
          }
        }
      }
    }

    if (count === 0) {
      return { count: 0, avgInitial: 0, avgReassessed: 0, avgDropPercent: 0 };
    }

    const avgInitial = Math.round(totalInitial / count);
    const avgReassessed = Math.round(totalReassessed / count);
    const avgDropPercent =
      totalInitial > 0
        ? Math.max(0, Math.round(((totalInitial - totalReassessed) / totalInitial) * 100))
        : 0;

    return {
      count,
      avgInitial,
      avgReassessed,
      avgDropPercent,
    };
  }, [allThoughts]);

  // 3. Top Thinking Patterns (Distortions)
  const topDistortions = useMemo(() => {
    const counts = new Map<string, { distortion: Distortion.Distortion; count: number }>();
    let total = 0;

    for (const thought of allThoughts) {
      if (thought.cognitiveDistortions) {
        for (const d of thought.cognitiveDistortions) {
          const fullDistortion = model.distortionData.list.find(
            (item) => item.slug === d.slug
          );
          if (fullDistortion) {
            const existing = counts.get(d.slug);
            if (existing) {
              existing.count++;
            } else {
              counts.set(d.slug, { distortion: fullDistortion, count: 1 });
            }
            total++;
          }
        }
      }
    }

    const sorted = Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return {
      items: sorted,
      total,
    };
  }, [allThoughts, model.distortionData.list]);

  // 4. Dominant Emotions
  const dominantEmotions = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalIntensity: number }>();

    for (const thought of allThoughts) {
      if (thought.emotions) {
        for (const em of thought.emotions) {
          if (em.name && em.name.trim()) {
            const key = em.name.trim().toLowerCase();
            const existing = map.get(key);
            if (existing) {
              existing.count++;
              existing.totalIntensity += em.intensity;
            } else {
              map.set(key, {
                name: em.name.trim(),
                count: 1,
                totalIntensity: em.intensity,
              });
            }
          }
        }
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [allThoughts]);

  const textColor = s.text.color;
  const cardBg = isDark ? "rgba(255, 255, 255, 0.06)" : "#ffffff";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const subtextColor = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.55)";
  const primaryColor = "#546de5";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Consistency & Streak Tracker */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor },
        ]}
      >
        <View style={[styles.cardHeader, isRtl && styles.rowReverse]}>
          <View style={[styles.iconCircle, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
            <Feather name="zap" size={18} color="#f59e0b" />
          </View>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {t("stats.streak_title") || "Daily Streak"}
          </Text>
        </View>

        {/* 3 Metric Pills */}
        <View style={[styles.metricRow, isRtl && styles.rowReverse]}>
          <View style={[styles.metricPill, { borderColor }]}>
            <Text style={[styles.metricValue, { color: "#f59e0b" }]}>
              {streak}
            </Text>
            <Text style={[styles.metricLabel, { color: subtextColor }]}>
              {t("stats.streak_unit") || "days"}
            </Text>
          </View>

          <View style={[styles.metricPill, { borderColor }]}>
            <Text style={[styles.metricValue, { color: primaryColor }]}>
              {allThoughts.length}
            </Text>
            <Text style={[styles.metricLabel, { color: subtextColor }]}>
              {t("stats.total_thoughts") || "Total"}
            </Text>
          </View>

          <View style={[styles.metricPill, { borderColor }]}>
            <Text style={[styles.metricValue, { color: "#10b981" }]}>
              {thoughtsThisWeek}
            </Text>
            <Text style={[styles.metricLabel, { color: subtextColor }]}>
              {t("stats.this_week") || "This Week"}
            </Text>
          </View>
        </View>

        {/* 7-Day Mini Circle Habit Tracker */}
        <View style={styles.habitTrackerContainer}>
          <View style={[styles.habitRow, isRtl && styles.rowReverse]}>
            {weekDays.map((day) => (
              <View key={day.dateKey} style={styles.habitDayCol}>
                <View
                  style={[
                    styles.habitDot,
                    day.active
                      ? { backgroundColor: primaryColor, borderColor: primaryColor }
                      : {
                          backgroundColor: isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.05)",
                          borderColor: isDark
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(0,0,0,0.1)",
                        },
                    day.isToday && styles.todayHighlight,
                  ]}
                >
                  {day.active ? (
                    <Feather name="check" size={12} color="#ffffff" />
                  ) : (
                    <View
                      style={[
                        styles.innerDot,
                        {
                          backgroundColor: isDark
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(0,0,0,0.15)",
                        },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.habitDayText,
                    {
                      color: day.isToday ? primaryColor : subtextColor,
                      fontWeight: day.isToday ? "700" : "500",
                    },
                  ]}
                >
                  {day.dayName}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 2. Emotional Relief Rate */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor },
        ]}
      >
        <View style={[styles.cardHeader, isRtl && styles.rowReverse]}>
          <View style={[styles.iconCircle, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
            <Feather name="trending-down" size={18} color="#10b981" />
          </View>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {t("stats.relief_title") || "Emotional Relief"}
          </Text>
        </View>

        {reliefStats.count > 0 ? (
          <View>
            <View style={[styles.reliefHeroRow, isRtl && styles.rowReverse]}>
              <View style={styles.reliefBadge}>
                <Feather name="arrow-down" size={20} color="#10b981" />
                <Text style={styles.reliefBadgeText}>
                  {reliefStats.avgDropPercent}%
                </Text>
              </View>
              <Text
                style={[
                  styles.reliefHeroDesc,
                  { color: subtextColor, textAlign: isRtl ? "right" : "left" },
                ]}
              >
                {t("stats.relief_desc") ||
                  "Average decrease in distress after challenging thoughts."}
              </Text>
            </View>

            {/* Before vs After Intensity Comparison */}
            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonRow}>
                <View style={[styles.comparisonLabels, isRtl && styles.rowReverse]}>
                  <Text style={[styles.compLabel, { color: subtextColor }]}>
                    {locale === "ar" ? "الشدة الأولية" : "Initial Intensity"}
                  </Text>
                  <Text style={[styles.compValue, { color: "#f87171" }]}>
                    {reliefStats.avgInitial}%
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, Math.max(0, reliefStats.avgInitial))}%`,
                        backgroundColor: "#f87171",
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={[styles.comparisonRow, { marginTop: 10 }]}>
                <View style={[styles.comparisonLabels, isRtl && styles.rowReverse]}>
                  <Text style={[styles.compLabel, { color: subtextColor }]}>
                    {locale === "ar" ? "بعد التحدي وإعادة التقييم" : "After Challenge"}
                  </Text>
                  <Text style={[styles.compValue, { color: "#10b981" }]}>
                    {reliefStats.avgReassessed}%
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, Math.max(0, reliefStats.avgReassessed))}%`,
                        backgroundColor: "#10b981",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCardContent}>
            <Feather
              name="info"
              size={24}
              color={subtextColor}
              style={{ marginBottom: 8 }}
            />
            <Text
              style={[
                styles.emptyCardText,
                { color: subtextColor, textAlign: isRtl ? "right" : "left" },
              ]}
            >
              {t("stats.no_relief_data") ||
                "Reassess your emotions in thoughts to see your relief rate!"}
            </Text>
          </View>
        )}
      </View>

      {/* 3. Top Thinking Patterns (Cognitive Distortions) */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor },
        ]}
      >
        <View style={[styles.cardHeader, isRtl && styles.rowReverse]}>
          <View style={[styles.iconCircle, { backgroundColor: "rgba(99, 102, 241, 0.15)" }]}>
            <Feather name="pie-chart" size={18} color="#6366f1" />
          </View>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {t("stats.distortions_title") || "Top Thinking Patterns"}
          </Text>
        </View>

        {topDistortions.items.length > 0 ? (
          <View style={styles.itemsList}>
            {topDistortions.items.map((item, idx) => {
              const pct = Math.round((item.count / topDistortions.total) * 100);
              const label = t(item.distortion.labelKey) || item.distortion.slug;
              const emoji = item.distortion.emojis ? item.distortion.emojis.join(" ") : "💡";

              return (
                <View key={item.distortion.slug} style={styles.distortionItem}>
                  <View style={[styles.distortionMetaRow, isRtl && styles.rowReverse]}>
                    <View style={[styles.distortionNameWrap, isRtl && styles.rowReverse]}>
                      <Text style={styles.distortionEmoji}>{emoji}</Text>
                      <Text
                        style={[
                          styles.distortionName,
                          { color: textColor, textAlign: isRtl ? "right" : "left" },
                        ]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                    </View>
                    <View style={[styles.countBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }]}>
                      <Text style={[styles.countBadgeText, { color: textColor }]}>
                        {item.count} {locale === "ar" ? "مرات" : "x"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: idx === 0 ? primaryColor : idx === 1 ? "#6366f1" : "#8b5cf6",
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCardContent}>
            <Feather
              name="info"
              size={24}
              color={subtextColor}
              style={{ marginBottom: 8 }}
            />
            <Text
              style={[
                styles.emptyCardText,
                { color: subtextColor, textAlign: isRtl ? "right" : "left" },
              ]}
            >
              {t("stats.no_distortions_data") ||
                "Select cognitive distortions in thoughts to see your top patterns."}
            </Text>
          </View>
        )}
      </View>

      {/* 4. Dominant Emotions */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor },
        ]}
      >
        <View style={[styles.cardHeader, isRtl && styles.rowReverse]}>
          <View style={[styles.iconCircle, { backgroundColor: "rgba(236, 72, 153, 0.15)" }]}>
            <Feather name="heart" size={18} color="#ec4899" />
          </View>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {t("stats.emotions_title") || "Most Frequent Emotions"}
          </Text>
        </View>

        {dominantEmotions.length > 0 ? (
          <View style={styles.itemsList}>
            {dominantEmotions.map((em) => {
              const avgIntensity = Math.round(em.totalIntensity / em.count);

              return (
                <View key={em.name} style={styles.distortionItem}>
                  <View style={[styles.distortionMetaRow, isRtl && styles.rowReverse]}>
                    <Text
                      style={[
                        styles.distortionName,
                        { color: textColor, textAlign: isRtl ? "right" : "left", flex: 1 },
                      ]}
                      numberOfLines={1}
                    >
                      {em.name}
                    </Text>

                    <View style={[styles.emotionMetaRight, isRtl && styles.rowReverse]}>
                      <Text style={[styles.avgIntensityText, { color: subtextColor }]}>
                        {avgIntensity}%
                      </Text>
                      <View
                        style={[
                          styles.countBadge,
                          {
                            backgroundColor: isDark
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.06)",
                            marginLeft: isRtl ? 0 : 8,
                            marginRight: isRtl ? 8 : 0,
                          },
                        ]}
                      >
                        <Text style={[styles.countBadgeText, { color: textColor }]}>
                          {em.count} {locale === "ar" ? "مرات" : "x"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(100, Math.max(0, avgIntensity))}%`,
                          backgroundColor: "#ec4899",
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCardContent}>
            <Feather
              name="info"
              size={24}
              color={subtextColor}
              style={{ marginBottom: 8 }}
            />
            <Text
              style={[
                styles.emptyCardText,
                { color: subtextColor, textAlign: isRtl ? "right" : "left" },
              ]}
            >
              {t("stats.no_emotions_data") ||
                "Add emotions to your thoughts to track your emotional landscape."}
            </Text>
          </View>
        )}
      </View>

      {/* Motivational Encouragement Footer */}
      <View
        style={[
          styles.encouragementCard,
          {
            backgroundColor: isDark
              ? "rgba(84, 109, 229, 0.15)"
              : "rgba(84, 109, 229, 0.08)",
            borderColor: isDark
              ? "rgba(84, 109, 229, 0.3)"
              : "rgba(84, 109, 229, 0.2)",
          },
        ]}
      >
        <Feather
          name="smile"
          size={20}
          color={primaryColor}
          style={{ marginBottom: 6 }}
        />
        <Text
          style={[
            styles.encouragementText,
            { color: textColor, textAlign: "center" },
          ]}
        >
          {t("stats.encouragement") ||
            "Every thought challenged is a step toward clarity and peace."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  metricPill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  habitTrackerContainer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.15)",
  },
  habitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habitDayCol: {
    alignItems: "center",
    flex: 1,
  },
  habitDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  todayHighlight: {
    transform: [{ scale: 1.08 }],
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  habitDayText: {
    fontSize: 12,
  },
  reliefHeroRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  reliefBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
    marginLeft: 12,
  },
  reliefBadgeText: {
    color: "#10b981",
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 4,
    marginRight: 4,
  },
  reliefHeroDesc: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  comparisonContainer: {
    backgroundColor: "rgba(128, 128, 128, 0.06)",
    borderRadius: 12,
    padding: 12,
  },
  comparisonRow: {
    width: "100%",
  },
  comparisonLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  compLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  compValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(128, 128, 128, 0.15)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  emptyCardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  emptyCardText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  itemsList: {
    gap: 12,
  },
  distortionItem: {
    width: "100%",
  },
  distortionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  distortionNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
    marginLeft: 8,
  },
  distortionEmoji: {
    fontSize: 15,
    marginRight: 6,
    marginLeft: 6,
  },
  distortionName: {
    fontSize: 13,
    fontWeight: "600",
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emotionMetaRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  avgIntensityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  encouragementCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  encouragementText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
});
