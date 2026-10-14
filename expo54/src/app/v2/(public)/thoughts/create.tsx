import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { useSafeWindowDimensions } from "@/src/hooks/use-safe-area";
import { Action, Distortion, Thought } from "@/src/model";
import { ImagePath } from "@/src/view";
import { EmotionEditor } from "@/src/view/emotion-editor";
import { EmotionReassessment } from "@/src/view/emotion-reassessment";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import Carousel, {
  CarouselRenderItem,
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const slideNames = [
  "automatic-thought",
  "distortions",
  "challenge",
  "alternative-thought",
] as const;
export const SlideName = z.enum(slideNames);
export type SlideName = z.infer<typeof SlideName>;
const slideNums = new Map<SlideName, number>(
  slideNames.map((name, i) => [name, i])
);

export default function Create() {
  return <LoadModel ready={Ready} />;
}

function Ready({ model, dispatch, style: s, translate: t }: ModelLoadedProps) {
  const [value, setValue] = useState(Thought.emptySpec());
  return (
    <SafeAreaView style={[s.view, s.p0, s.py4]}>
      <CBTForm
        model={model}
        style={s}
        translate={t}
        value={value}
        onChange={setValue}
        onSubmit={() => dispatch(Action.createThought(value, new Date()))}
      />
    </SafeAreaView>
  );
}

/**
 * Used for both the create and edit pages.
 */
export function CBTForm(
  props: Pick<ModelLoadedProps, "model" | "style" | "translate"> & {
    slide?: SlideName; // used only for editing - select this slide on page load
    value: Thought.Spec;
    onChange?: (t: Thought.Spec) => void;
    onSubmit?: () => void;
  }
) {
  const { style: s } = props;
  const defaultIndex = props.slide ? slideNums.get(props.slide) ?? 0 : 0;
  // "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
  // 2025/11 - I'm doing this right, it's carousel's fault:
  // https://github.com/dohooo/react-native-reanimated-carousel/issues/857
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  const w = useSafeWindowDimensions();
  const width = Math.min(w.width, s.container.maxWidth);
  return (
    <View style={[s.container]}>
      <Carousel
        ref={ref}
        data={[...slideNames]}
        onProgressChange={progress}
        renderItem={CBTFormItem({ ...props, progress })}
        width={width}
        height={w.height - 150}
        onSnapToItem={(index) => {
          Keyboard.dismiss();
        }}
        loop={false}
        defaultIndex={defaultIndex}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: Math.round(width * 0.15),
        }}
        // fix vertical scrolling for distortions
        onConfigurePanGesture={(gesture) => {
          "worklet";
          gesture.activeOffsetX([-10, 10]);
        }}
      />
      <Pagination.Basic
        progress={progress}
        data={[...slideNames]}
        dotStyle={s.paginationDot}
        activeDotStyle={s.activePaginationDot}
        containerStyle={{ gap: 5, marginTop: 10 }}
        onPress={onPressPagination}
      />
    </View>
  );
}

function CBTFormItem(
  props: Pick<ModelLoadedProps, "model" | "style" | "translate"> & {
    progress: SharedValue<number>;
    value: Thought.Spec;
    onChange?: (t: Thought.Spec) => void;
    onSubmit?: () => void;
  }
): CarouselRenderItem<SlideName> {
  const { model, value, progress, style: s, translate: t } = props;
  const onChange = props.onChange ?? (() => {});
  const onSubmit = props.onSubmit ?? (() => {});
  const isDark = model.settings.theme === "dark" || (model.settings.theme === null && model.deviceColorScheme === "dark");
  const nowIso = new Date().toISOString();

  return function CBTFormItem({ item }) {
    const [showDetails, setShowDetails] = useState(false);
    switch (item) {
      case "automatic-thought": {
        return (
          <ScrollView
            style={[s.flex1]}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[s.subheader, { marginBottom: 6 }]}>
              {t("cbt_form.situation_placeholder") || "Situation"}
            </Text>
            <TextInput
              style={[s.textInput, { height: 75, marginBottom: 12 }]}
              placeholder={
                (model.settings.locale ?? model.deviceLocale) === "ar"
                  ? "ما هو الموقف أو السياق الذي حدث؟ (مثال: كنت في العمل، مقابلة شخص...)"
                  : "What was the situation? (e.g. at work, talking to a friend...)"
              }
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={value.situation ?? ""}
              multiline={true}
              numberOfLines={2}
              onChangeText={(v) =>
                onChange({
                  ...value,
                  situation: v,
                  blockTimestamps: {
                    ...(value.blockTimestamps ?? {}),
                    situation: nowIso,
                  },
                })
              }
            />
            <Text style={[s.subheader, { marginBottom: 6 }]}>
              {t("auto_thought") || "Automatic Thought"}
            </Text>
            <TextInput
              style={[s.textInput, { height: 95, marginBottom: 12 }]}
              placeholder={t("cbt_form.auto_thought_placeholder")}
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={value.automaticThought}
              multiline={true}
              numberOfLines={3}
              onChangeText={(v) =>
                onChange({
                  ...value,
                  automaticThought: v,
                  blockTimestamps: {
                    ...(value.blockTimestamps ?? {}),
                    automaticThought: nowIso,
                  },
                })
              }
            />
            <EmotionEditor
              emotions={value.emotions ?? []}
              onChange={(ems) =>
                onChange({
                  ...value,
                  emotions: ems,
                  blockTimestamps: {
                    ...(value.blockTimestamps ?? {}),
                    automaticThought: nowIso,
                  },
                })
              }
              allThoughts={model.thoughts.values()}
              textColor={s.text.color}
              isDark={isDark}
              translate={t}
            />
          </ScrollView>
        );
      }
      case "distortions": {
        const selectorBtn = (v: Distortion.Distortion) =>
          value.cognitiveDistortions.has(v) ? s.bgSelected : s.bg;
        const selectorText = (v: Distortion.Distortion) =>
          value.cognitiveDistortions.has(v) ? s.selectedText : s.text;
        const selectorCardBg = (v: Distortion.Distortion) =>
          value.cognitiveDistortions.has(v) ? s.bgCardSelected : s.bgCard;
        const img = (i: number) =>
          ImagePath.bubbles[i % ImagePath.bubbles.length];
        return (
          <>
            <Text style={[s.subheader]}>{t("cog_distortion")}</Text>
            <Pressable
              style={[s.flexRow, s.itemsCenter, s.my2]}
              onPress={() => setShowDetails(!showDetails)}
            >
              <Switch value={showDetails} onValueChange={setShowDetails} />
              <Text style={[s.text, s.mx2]}>
                {t("cbt_form.show_details")}
              </Text>
            </Pressable>
            <ScrollView>
              {model.distortionData.list.map((d, i) => {
                function onPress() {
                  // ignore button-presses if the distortion slide is not focused.
                  // this prevents pressing the button while swiping away from the distortion list.
                  if (progress.get() !== slideNums.get("distortions")) return;

                  const ds = new Set(value.cognitiveDistortions);
                  // toggle
                  if (ds.has(d)) {
                    ds.delete(d);
                  } else {
                    ds.add(d);
                  }
                  return onChange({
                    ...value,
                    cognitiveDistortions: ds,
                    blockTimestamps: {
                      ...(value.blockTimestamps ?? {}),
                      distortions: nowIso,
                    },
                  });
                }
                return (
                  <TouchableOpacity
                    key={d.slug}
                    style={[selectorBtn(d), s.rounded, s.border, s.p1, s.my1]}
                    onPress={onPress}
                  >
                    <Text style={[selectorText(d), s.m1]}>
                      {Distortion.emoji(d)} {t(d.labelKey)}
                    </Text>
                    {showDetails ? (
                      <>
                        <Text style={[selectorText(d), s.m1, s.mx4]}>
                          {d.explanationKeys.map((k) => t(k)).join("\n\n")}
                        </Text>
                        <View style={[s.flexRow, s.my2]}>
                          <Image source={img(i)} style={[s.bubble, s.m2]} />
                          <Text
                            style={[
                              selectorText(d),
                              selectorCardBg(d),
                              s.border,
                              s.rounded,
                              s.p2,
                            ]}
                          >
                            {t(d.explanationThoughtKey)}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <Text style={[selectorText(d), s.m1, s.mx4]}>
                        {t(d.descriptionKey)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        );
      }
      case "challenge": {
        return (
          <>
            <Text style={[s.subheader]}>{t("challenge")}</Text>
            <TextInput
              style={[s.textInput]}
              // placeholderTextColor={textInputPlaceholderColor}
              placeholder={t("cbt_form.changed_placeholder")}
              value={value.challenge}
              multiline={true}
              numberOfLines={6}
              onChangeText={(v) =>
                onChange({
                  ...value,
                  challenge: v,
                  blockTimestamps: {
                    ...(value.blockTimestamps ?? {}),
                    challenge: nowIso,
                  },
                })
              }
            />
          </>
        );
      }
      case "alternative-thought": {
        return (
          <ScrollView
            style={[s.flex1]}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[s.subheader]}>{t("alt_thought")}</Text>
            <Text style={[s.text, s.mb2]}>{t("alt_thought_description")}</Text>
            <TextInput
              style={[s.textInput, { height: 110 }]}
              placeholder={t("cbt_form.alt_thought_placeholder")}
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={value.alternativeThought}
              multiline={true}
              numberOfLines={4}
              onChangeText={(v) =>
                onChange({
                  ...value,
                  alternativeThought: v,
                  blockTimestamps: {
                    ...(value.blockTimestamps ?? {}),
                    alternativeThought: nowIso,
                  },
                })
              }
            />
            <EmotionReassessment
              emotions={value.emotions ?? []}
              onChange={(ems) =>
                onChange({
                  ...value,
                  emotions: ems,
                  blockTimestamps: {
                    ...(value.blockTimestamps ?? {}),
                    alternativeThought: nowIso,
                  },
                })
              }
              textColor={s.text.color}
              isDark={isDark}
              translate={t}
            />
            <TouchableOpacity
              style={[s.button, s.bgSelected, s.mt4]}
              onPress={onSubmit}
            >
              <Text style={[s.selectedText]}>{t("cbt_form.submit")}</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      }
      default:
        throw new Error(`unknown slide: ${item satisfies never}`);
    }
  };
}
