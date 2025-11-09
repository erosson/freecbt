import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, Distortion, Thought } from "@/src/model";
import { LinkButton } from "@/src/view/view";
import React, { useState } from "react";
import {
  Button,
  Keyboard,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  CarouselRenderItem,
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import z from "zod";

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
    <View style={[s.view]}>
      <View style={[s.flexRow, s.justifyBetween, s.container]}>
        <Text style={[s.header]}>{t("cbt_form.header")}</Text>
        <View>
          <View>
            <LinkButton
              style={s}
              href={Routes.helpV2()}
              label={t("accessibility.help_button")}
              icon="help-circle"
            />
            <LinkButton
              style={s}
              href={Routes.thoughtListV2()}
              label={t("accessibility.list_button")}
              icon="list"
            />
          </View>
        </View>
      </View>
      <CBTForm
        model={model}
        style={s}
        translate={t}
        value={value}
        onChange={setValue}
        onSubmit={() => dispatch(Action.createThought(value))}
      />
    </View>
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
  const { model, style: s } = props;
  const defaultIndex = props.slide ? slideNums.get(props.slide) ?? 0 : 0;
  console.log("defaultIndex", { slide: props.slide, defaultIndex });
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  const width = Math.min(model.deviceWindow.width, s.container.maxWidth);
  return (
    <View style={[s.container]}>
      <Carousel
        ref={ref}
        data={[...slideNames]}
        onProgressChange={progress}
        renderItem={CBTFormItem({ ...props, progress: progress.get() })}
        width={width}
        height={model.deviceWindow.height - 150}
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
    progress: number;
    value: Thought.Spec;
    onChange?: (t: Thought.Spec) => void;
    onSubmit?: () => void;
  }
): CarouselRenderItem<SlideName> {
  const { model, value, progress, style: s, translate: t } = props;
  const onChange = props.onChange ?? (() => {});
  const onSubmit = props.onSubmit ?? (() => {});
  return function CBTFormItem({ item }) {
    const [showDetails, setShowDetails] = useState(false);
    switch (item) {
      case "automatic-thought": {
        return (
          <>
            <Text style={[s.subheader]}>{t("auto_thought")}</Text>
            <TextInput
              style={[s.textInput]}
              // placeholderTextColor={textInputPlaceholderColor}
              placeholder={t("cbt_form.auto_thought_placeholder")}
              value={value.automaticThought}
              multiline={true}
              numberOfLines={6}
              onChangeText={(v) => onChange({ ...value, automaticThought: v })}
            />
          </>
        );
      }
      case "distortions": {
        const selectorBtn = (v: Distortion.Distortion) =>
          value.cognitiveDistortions.has(v) ? s.bgSelected : s.bg;
        const selectorText = (v: Distortion.Distortion) =>
          value.cognitiveDistortions.has(v) ? s.selectedText : s.text;
        return (
          <>
            <Text style={[s.subheader]}>{t("cog_distortion")}</Text>
            <Pressable
              style={[s.flexRow]}
              onPress={() => setShowDetails(!showDetails)}
            >
              <Text style={[s.text]}>
                <Switch value={showDetails} onValueChange={setShowDetails} />
              </Text>
              <Text style={[s.text, s.alignMiddle, s.mx2, s.hFull]}>
                {t("cbt_form.show_details")}
              </Text>
            </Pressable>
            <ScrollView>
              {model.distortionData.list.map((d) => {
                function onPress() {
                  // ignore button-presses if the distortion slide is not focused.
                  // this prevents pressing the button while swiping away from the distortion list.
                  if (progress !== 1) return;

                  const ds = new Set(value.cognitiveDistortions);
                  // toggle
                  if (ds.has(d)) {
                    ds.delete(d);
                  } else {
                    ds.add(d);
                  }
                  return onChange({ ...value, cognitiveDistortions: ds });
                }
                return (
                  <TouchableOpacity
                    key={d.slug}
                    style={[selectorBtn(d), s.rounded, s.border, s.p1]}
                    onPress={onPress}
                  >
                    <Text style={[selectorText(d)]}>
                      {Distortion.emoji(d)} {t(d.labelKey)}
                      {"\n\n"}
                      {showDetails
                        ? d.explanationKeys.map((k) => t(k)).join("\n\n")
                        : t(d.descriptionKey)}
                    </Text>
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
              onChangeText={(v) => onChange({ ...value, challenge: v })}
            />
          </>
        );
      }
      case "alternative-thought": {
        return (
          <>
            <Text style={[s.subheader]}>{t("alt_thought")}</Text>
            <Text style={[s.text]}>{t("alt_thought_description")}</Text>
            <TextInput
              style={[s.textInput]}
              // placeholderTextColor={textInputPlaceholderColor}
              placeholder={t("cbt_form.alt_thought_placeholder")}
              value={value.alternativeThought}
              multiline={true}
              numberOfLines={6}
              onChangeText={(v) =>
                onChange({ ...value, alternativeThought: v })
              }
            />
            <Button onPress={onSubmit} title={t("cbt_form.submit")} />
          </>
        );
      }
      default: {
        const _e: never = item;
        throw new Error(`unknown slide: ${_e}`);
      }
    }
  };
}
