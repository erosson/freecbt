import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { useSafeWindowDimensions } from "@/src/hooks/use-safe-area";
import { Action, Model, Thought } from "@/src/model";
import { EmotionDeltaBadge } from "@/src/view/emotion-badge";
import { ThoughtCard } from "@/src/view/thought-card";
import { ThoughtsStats } from "@/src/view/thoughts-stats";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return <LoadModel ready={Ready} />;
}

function Ready(props: ModelLoadedProps) {
  const { model, dispatch, style: s, translate: t } = props;
  const [viewMode, setViewMode] = useState<"deck" | "list" | "stats">("deck");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Newest thoughts first for the swipeable deck
  const allThoughts = Model.thoughtsList(model).slice().reverse();
  const dateGroups = Model.thoughtsByDate(model);
  const today = new Date().toDateString();

  const isDark =
    model.settings.theme === "dark" ||
    (model.settings.theme === null && model.deviceColorScheme === "dark");
  const locale = Model.locale(model);

  const carouselRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const windowDim = useSafeWindowDimensions();
  const carouselWidth = Math.min(windowDim.width - 32, s.container.maxWidth);
  const carouselHeight = Math.max(300, windowDim.height - 180);

  // Desktop keyboard navigation (Left/Right arrows)
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "deck" || allThoughts.length <= 1) return;
      if (e.key === "ArrowLeft") {
        carouselRef.current?.prev();
      } else if (e.key === "ArrowRight") {
        carouselRef.current?.next();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, allThoughts.length]);

  const textColor = s.text.color;
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
  const activeBtnBg = "#546de5";
  const isRtl = locale === "ar" || locale === "fa";

  const handleDelete = (uuid: Thought.Id) => {
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
        dispatch(Action.deleteThought(uuid));
      }
    } else {
      Alert.alert(title, message, [
        { text: cancelText, style: "cancel" },
        {
          text: deleteText,
          style: "destructive",
          onPress: () => dispatch(Action.deleteThought(uuid)),
        },
      ]);
    }
  };

  if (allThoughts.length === 0) {
    return (
      <SafeAreaView style={[s.view]}>
        <View style={[s.container, styles.emptyContainer]}>
          <Feather
            name="book-open"
            size={48}
            color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
            style={{ marginBottom: 16 }}
          />
          <Text style={[s.subheader, { textAlign: "center" }]}>
            {t("cbt_list.empty")}
          </Text>
          <View style={[s.flexRow, s.my4, { gap: 10, flexWrap: "wrap", justifyContent: "center" }]}>
            <Link href={Routes.thoughtCreateV2()} asChild>
              <TouchableOpacity style={[s.button, s.bgSelected]}>
                <Text style={[s.selectedText]}>
                  + {t("accessibility.new_thought_button")}
                </Text>
              </TouchableOpacity>
            </Link>
            <Link href={Routes.freeWriteV2()} asChild>
              <TouchableOpacity style={[s.button, { backgroundColor: isDark ? "#374151" : "#e0e7ff" }]}>
                <Text style={{ color: isDark ? "#93c5fd" : "#4338ca", fontWeight: "700" }}>
                  ✏️ {t("free_write.header") || "Free Writing"}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.view]}>
      <View style={[s.container, styles.mainContainer]}>
        {/* Navigation Toolbar */}
        <View style={styles.toolbar}>
          {/* Deck Counter & Desktop Controls */}
          {viewMode === "deck" ? (
            <View style={styles.deckNavControls}>
              <TouchableOpacity
                style={[
                  styles.arrowBtn,
                  { borderColor, opacity: currentIndex > 0 ? 1 : 0.4 },
                ]}
                disabled={currentIndex === 0}
                onPress={() => carouselRef.current?.prev()}
                accessibilityLabel={t("cbt_list.prev") || "Previous"}
              >
                <Feather
                  name={isRtl ? "chevron-right" : "chevron-left"}
                  size={18}
                  color={textColor}
                />
              </TouchableOpacity>

              <Text style={[styles.counterText, { color: textColor }]}>
                {`${currentIndex + 1} / ${allThoughts.length}`}
              </Text>

              <TouchableOpacity
                style={[
                  styles.arrowBtn,
                  {
                    borderColor,
                    opacity: currentIndex < allThoughts.length - 1 ? 1 : 0.4,
                  },
                ]}
                disabled={currentIndex >= allThoughts.length - 1}
                onPress={() => carouselRef.current?.next()}
                accessibilityLabel={t("cbt_list.next") || "Next"}
              >
                <Feather
                  name={isRtl ? "chevron-left" : "chevron-right"}
                  size={18}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>
          ) : viewMode === "list" ? (
            <Text style={[s.subheader, { marginBottom: 0 }]}>
              {allThoughts.length}{" "}
              {locale === "ar" ? "أفكار مسجلة" : "Thoughts"}
            </Text>
          ) : (
            <Text style={[s.subheader, { marginBottom: 0 }]}>
              {t("stats.tab") || (locale === "ar" ? "الإحصائيات" : "Stats")}
            </Text>
          )}

          {/* View Toggle Buttons */}
          <View style={[styles.toggleGroup, { borderColor }]}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                viewMode === "deck" && { backgroundColor: activeBtnBg },
              ]}
              onPress={() => setViewMode("deck")}
            >
              <Feather
                name="layers"
                size={14}
                color={viewMode === "deck" ? "#fff" : textColor}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: viewMode === "deck" ? "#fff" : textColor },
                ]}
              >
                {t("cbt_list.deck_view") || "Cards"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                viewMode === "list" && { backgroundColor: activeBtnBg },
              ]}
              onPress={() => setViewMode("list")}
            >
              <Feather
                name="list"
                size={14}
                color={viewMode === "list" ? "#fff" : textColor}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: viewMode === "list" ? "#fff" : textColor },
                ]}
              >
                {t("cbt_list.list_view") || "List"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                viewMode === "stats" && { backgroundColor: activeBtnBg },
              ]}
              onPress={() => setViewMode("stats")}
            >
              <Feather
                name="bar-chart-2"
                size={14}
                color={viewMode === "stats" ? "#fff" : textColor}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: viewMode === "stats" ? "#fff" : textColor },
                ]}
              >
                {t("stats.tab") || (locale === "ar" ? "الإحصائيات" : "Stats")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content: Swipeable Deck vs. Grouped List */}
        {viewMode === "deck" ? (
          <View style={styles.deckWrapper}>
            <Carousel
              ref={carouselRef}
              data={allThoughts}
              width={carouselWidth}
              height={carouselHeight}
              loop={false}
              onProgressChange={progress}
              onSnapToItem={(idx) => setCurrentIndex(idx)}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.94,
                parallaxScrollingOffset: Math.round(carouselWidth * 0.08),
              }}
              // Ensures horizontal swipes flip cards, while vertical touches scroll inside the card
              onConfigurePanGesture={(gesture) => {
                "worklet";
                gesture.activeOffsetX([-15, 15]);
              }}
              renderItem={({ item: thought }) => (
                <View style={styles.carouselItemContainer}>
                  <ThoughtCard
                    thought={thought}
                    model={model}
                    style={s}
                    translate={t}
                    isDark={isDark}
                    locale={locale}
                    onDelete={() => handleDelete(thought.uuid)}
                  />
                </View>
              )}
            />
            {allThoughts.length > 1 && (
              <Pagination.Basic
                progress={progress}
                data={allThoughts}
                dotStyle={s.paginationDot}
                activeDotStyle={s.activePaginationDot}
                containerStyle={styles.paginationContainer}
                onPress={(idx) => {
                  carouselRef.current?.scrollTo({
                    count: idx - progress.value,
                    animated: true,
                  });
                }}
              />
            )}
          </View>
        ) : viewMode === "list" ? (
          <ScrollView style={styles.listScrollView}>
            {dateGroups.map(([date, thoughts]) => (
              <React.Fragment key={date}>
                <Text style={[s.subheader, { marginTop: 14, marginBottom: 8 }]}>
                  {today === date ? t("cbt_list.today") : date}
                </Text>
                {thoughts.map((thought) => (
                  <View
                    key={thought.uuid}
                    style={[
                      styles.listItemRow,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "#fff",
                        borderColor,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.listItemContent}
                      onPress={() => {
                        const targetIdx = allThoughts.findIndex(
                          (t) => t.uuid === thought.uuid
                        );
                        if (targetIdx >= 0) {
                          setCurrentIndex(targetIdx);
                          setViewMode("deck");
                        }
                      }}
                    >
                      <Text style={[styles.listItemTitle, { color: textColor }]}>
                        {Thought.label(thought, model)}
                      </Text>

                      {thought.emotions && thought.emotions.length > 0 && (
                        <View style={styles.listItemEmotionsRow}>
                          {thought.emotions.map((em, idx) => (
                            <EmotionDeltaBadge
                              key={`${em.name}-${idx}`}
                              emotion={em}
                              isDark={isDark}
                              compact={true}
                            />
                          ))}
                        </View>
                      )}

                      {Thought.emojis(thought) ? (
                        <Text style={[styles.emojisBadge, { color: textColor }]}>
                          {Thought.emojis(thought)}
                        </Text>
                      ) : null}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.listDeleteBtn}
                      onPress={() => handleDelete(thought.uuid)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel={t("accessibility.delete_thought_button") || "Delete"}
                    >
                      <Feather name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </React.Fragment>
            ))}
          </ScrollView>
        ) : (
          <ThoughtsStats
            model={model}
            style={s}
            translate={t}
            isDark={isDark}
            locale={locale}
          />
        )}

        {/* Dual Floating Action Buttons: Free Write & New Thought */}
        <View
          style={[
            styles.fabContainer,
            isRtl ? { left: 20 } : { right: 20 },
          ]}
        >
          <Link href={Routes.freeWriteV2()} asChild>
            <TouchableOpacity
              style={[
                styles.fabSecondaryButton,
                { backgroundColor: isDark ? "#374151" : "#e0e7ff" },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={t("free_write.header") || "Free Writing"}
            >
              <Feather
                name="edit-3"
                size={20}
                color={isDark ? "#93c5fd" : "#4338ca"}
              />
            </TouchableOpacity>
          </Link>

          <Link href={Routes.thoughtCreateV2()} asChild>
            <TouchableOpacity
              style={[
                styles.fabButton,
                { backgroundColor: activeBtnBg },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={t("accessibility.new_thought_button") || "New Thought"}
            >
              <Feather name="plus" size={26} color="#fff" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  deckNavControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  counterText: {
    fontSize: 13,
    fontWeight: "700",
  },
  toggleGroup: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deckWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  carouselItemContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 4,
  },
  paginationContainer: {
    gap: 6,
    marginTop: 8,
  },
  listScrollView: {
    flex: 1,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
    marginRight: 8,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  listItemEmotionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  emojisBadge: {
    fontSize: 16,
  },
  listDeleteBtn: {
    padding: 8,
    borderRadius: 8,
  },
  fabContainer: {
    position: "absolute",
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 99,
  },
  fabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  fabSecondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
