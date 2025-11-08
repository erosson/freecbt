import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, Thought } from "@/src/model";
import React, { useState } from "react";
import { Button, Keyboard, Text, TextInput, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  CarouselRenderItem,
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";

const slideNames = [
  "automatic-thought",
  "distortions",
  "challenge",
  "alternative-thought",
] as const;
type SlideName = (typeof slideNames)[number];
const slideNums = new Map<SlideName, number>(
  slideNames.map((name, i) => [name, i])
);

export default function Create() {
  return <LoadModel ready={Ready} />;
}

function Ready({ model, dispatch, style: s, translate: t }: ModelLoadedProps) {
  const [value, setValue] = useState(emptyForm());
  return (
    <View style={[s.view]}>
      <Text style={[s.header]}>{t("cbt_form.header")}</Text>
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

function emptyForm(): Thought.Spec {
  return {
    automaticThought: "",
    cognitiveDistortions: new Set(),
    challenge: "",
    alternativeThought: "",
  };
}

export function CBTForm(
  props: Pick<ModelLoadedProps, "model" | "style" | "translate"> & {
    value: Thought.Spec;
    onChange?: (t: Thought.Spec) => void;
    onSubmit?: () => void;
  }
) {
  const { model, style: s, translate: t, value } = props;
  const onChange = props.onChange ?? (() => {});
  const onSubmit = props.onSubmit ?? (() => {});
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  const CBTFormItem: CarouselRenderItem<SlideName> = ({ item }) => {
    switch (item) {
      case "automatic-thought":
        return (
          <>
            <Text style={[s.text]}>autothought</Text>
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
          // <AutomaticThought
          //   value={props.automatic}
          //   onChange={props.onChangeAutomaticThought}
          // />
        );
      case "distortions":
        return (
          <Text style={[s.text]}>distortions</Text>
          // <Distortions
          //   selected={props.distortions}
          //   onChange={props.onChangeDistortion}
          // />
        );
      case "challenge":
        return (
          <>
            <Text style={[s.text]}>challenge</Text>
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
          // <Challenge
          //   value={props.challenge}
          //   onChange={props.onChangeChallenge}
          // />
        );
      case "alternative-thought":
        return (
          <>
            <Text style={[s.text]}>alt</Text>
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
          // <>
          //   <AlternativeThought
          //     value={props.alternative}
          //     onChange={props.onChangeAlternativeThought}
          //   />

          //   <View
          //     style={{
          //       marginTop: 12,
          //     }}
          //   >
          //     <ActionButton
          //       title={i18n.t("cbt_form.submit")}
          //       width="100%"
          //       onPress={props.onSave}
          //     />
          //   </View>
          // </>
        );
      default: {
        const _e: never = item;
        throw new Error(`unknown slide: ${_e}`);
      }
    }
  };
  return (
    <>
      <Carousel
        ref={ref}
        data={[...slideNames]}
        onProgressChange={progress}
        renderItem={CBTFormItem}
        width={model.deviceWindow.width}
        height={model.deviceWindow.height - 150}
        onSnapToItem={(index) => {
          Keyboard.dismiss();
        }}
        loop={false}
        // defaultIndex={slideNums.get(props.slideToShow) ?? 0}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: Math.round(model.deviceWindow.width * 0.15),
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
    </>
  );
}
