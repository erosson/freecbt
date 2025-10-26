import { S } from "@/src/style";
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
                  <Text style={[S.header]}>Automatic thought</Text>
                  <TextInput style={[S.textInput]} multiline={true} />
                </View>
              );
            }
            case "distortions": {
              return (
                <View style={[S.carouselItem]}>
                  <Text style={[S.header]}>Distortions</Text>
                  <Text>TODO</Text>
                </View>
              );
            }
            case "challenge": {
              return (
                <View style={[S.carouselItem]}>
                  <Text style={[S.header]}>Challenge</Text>
                  <TextInput style={[S.textInput]} multiline={true} />
                </View>
              );
            }
            case "alternative": {
              return (
                <View style={[S.carouselItem]}>
                  <Text style={[S.header]}>Alternative</Text>
                  <TextInput style={[S.textInput]} multiline={true} />
                  <TouchableOpacity style={[S.button]}>Submit</TouchableOpacity>
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
        dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 50 }}
        containerStyle={{ gap: 5, marginTop: 10 }}
        onPress={onPressPagination}
      />
    </View>
  );
}
