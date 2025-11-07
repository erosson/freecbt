import { useTranslate } from "@/src/hooks/use-i18n";
import { modelSpinner, useModel } from "@/src/hooks/use-model";
import { useStyle } from "@/src/hooks/use-style";
import { Model } from "@/src/model";
import { Keyboard, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

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
  const [model, dispatch] = useModel();
  const s = useStyle(Model.colorScheme(model));
  const t = useTranslate();
  return modelSpinner(model, (model) => (
    <View style={[s.view]}>
      <Text style={[s.header]}>{t("cbt_form.header")}</Text>
      <Carousel
        data={[...slideNames]}
        renderItem={({ item }) => {
          switch (item) {
            case "automatic-thought":
              return (
                <Text style={[s.text]}>autothought</Text>
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
                <Text style={[s.text]}>challenge</Text>
                // <Challenge
                //   value={props.challenge}
                //   onChange={props.onChangeChallenge}
                // />
              );
            case "alternative-thought":
              return (
                <Text style={[s.text]}>alt</Text>
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
        }}
        width={model.deviceWindow.width}
        height={model.deviceWindow.height}
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
    </View>
  ));
}
