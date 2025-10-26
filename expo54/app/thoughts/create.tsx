import i18n from "@/src/i18n";
import { DistortionData } from "@/src/model";
import { C, S } from "@/src/style";
import React from "react";
import {
  Dimensions,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";

export default function Create() {
  return (
    <View style={[S.centeredView]}>
      <CBTCarousel />
    </View>
  );
}

function CBTCarousel() {
  const data = [
    "automatic",
    "distortions",
    "challenge",
    "alternative",
  ] as const;
  // "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.":
  // I can't fix this logged error, it's up to the react-native-reanimated-carousel maintainers
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };
  const width = Math.round(Dimensions.get("window").width * 0.75);
  const height = Math.round(Dimensions.get("window").height * 0.75);
  return (
    <View style={{ flex: 1 }}>
      <Carousel
        ref={ref}
        data={[...data]}
        width={width}
        height={height}
        onProgressChange={progress}
        onSnapToItem={(index) => {
          Keyboard.dismiss();
        }}
        loop={false}
        defaultIndex={0}
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
        renderItem={(item) => {
          switch (item.item) {
            case "automatic": {
              return (
                <View style={[S.carouselItem]}>
                  <Text style={[S.header]}>{i18n.t("auto_thought")}</Text>
                  <TextInput style={[S.textInput]} multiline={true} />
                </View>
              );
            }
            case "distortions": {
              return (
                <View style={[S.carouselItem]}>
                  <Text style={[S.header]}>{i18n.t("cog_distortion")}</Text>
                  <View style={[S.flexColumn]}>
                    {DistortionData.list.map((dist) => {
                      const selected = true;
                      const textStyle = selected
                        ? S.formDistortionItemSelectedText
                        : S.text;
                      return (
                        <TouchableOpacity
                          style={[
                            S.formDistortionItem,
                            selected ? S.formDistortionItemSelected : null,
                          ]}
                        >
                          <Text style={[textStyle]}>
                            {dist.emojis[0]} {i18n.t(dist.labelKey)}
                          </Text>
                          <Text style={[textStyle]}>
                            {i18n.t(dist.descriptionKey)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            }
            case "challenge": {
              return (
                <View style={[S.carouselItem]}>
                  <Text style={[S.header]}>{i18n.t("challenge")}</Text>
                  <TextInput style={[S.textInput]} multiline={true} />
                </View>
              );
            }
            case "alternative": {
              return (
                <View style={[S.carouselItem]}>
                  <Text style={[S.header]}>{i18n.t("alt_thought")}</Text>
                  <TextInput style={[S.textInput]} multiline={true} />
                  <TouchableOpacity style={[S.button]}>
                    <Text style={[S.buttonText]}>
                      {i18n.t("cbt_form.submit")}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }
            default: {
              const e: never = item.item;
              throw new Error(`unexpected carousel renderItem: ${e}`);
            }
          }
        }}
      />
      <Pagination.Basic
        progress={progress}
        data={[...data]}
        activeDotStyle={{
          backgroundColor: C.text,
        }}
        dotStyle={{
          backgroundColor: C.paginationDot,
          borderRadius: 50,
        }}
        containerStyle={{ gap: 5, marginTop: 10 }}
        onPress={onPressPagination}
      />
    </View>
  );
}
