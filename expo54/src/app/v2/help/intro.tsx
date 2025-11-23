import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { useSafeWindowDimensions } from "@/src/hooks/use-safe-area";
import { ImagePath } from "@/src/view";
import { Link } from "expo-router";
import React from "react";
import { Image, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  CarouselRenderItem,
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return <LoadModel ready={Ready} />;
}
const slideNames = ["record", "challenge", "change", "reminders"] as const;
export type SlideName = (typeof slideNames)[number];
// export const SlideName = z.enum(slideNames);
// export type SlideName = z.infer<typeof SlideName>;
function Ready(props: ModelLoadedProps) {
  const { model, style: s } = props;
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const featureReminders = false;
  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  const slides = featureReminders ? slideNames : slideNames.slice(0, -1);
  const w = useSafeWindowDimensions();
  const width = Math.min(w.width, s.container.maxWidth);
  return (
    <SafeAreaView style={[s.view, s.p0, s.py4]}>
      <View style={[s.container]}>
        <Carousel
          ref={ref}
          data={[...slides]}
          onProgressChange={progress}
          renderItem={IntroItem({ ...props, featureReminders })}
          width={width}
          height={w.height - 150}
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
        />
        <Pagination.Basic
          progress={progress}
          data={[...slides]}
          dotStyle={s.paginationDot}
          activeDotStyle={s.activePaginationDot}
          containerStyle={{ gap: 5, marginTop: 10 }}
          onPress={onPressPagination}
        />
      </View>
    </SafeAreaView>
  );
}

function IntroItem(
  props: Pick<ModelLoadedProps, "model" | "style" | "translate"> & {
    featureReminders: boolean;
  }
): CarouselRenderItem<SlideName> {
  const { featureReminders, style: s, translate: t } = props;
  return function IntroItem({ item }) {
    switch (item) {
      case "record": {
        return (
          <>
            <Image
              source={ImagePath.looker}
              resizeMode="contain"
              style={[s.selfCenter, s.my4, { width: 156, height: 156 }]}
            />
            <Text style={[s.header]}>{t("onboarding_screen.readme")}</Text>
            <Link
              style={[s.flex1, s.border, s.rounded, s.p2, s.button]}
              href="https://freecbt.erosson.org/explanation/?ref=quirk"
            >
              <TouchableOpacity style={[s.flex1]}>
                <Text style={[s.buttonText]}>
                  {t("onboarding_screen.header")}
                </Text>
              </TouchableOpacity>
            </Link>
          </>
        );
      }
      case "challenge": {
        return (
          <>
            <Image
              source={ImagePath.eater}
              resizeMode="contain"
              style={[s.selfCenter, s.my4, { width: 156, height: 156 }]}
            />
            <Text style={[s.header]}>
              {t("onboarding_screen.block1.header")}
            </Text>
            <Text style={[s.subheader]}>
              {t("onboarding_screen.block1.body")}
            </Text>
          </>
        );
      }
      case "change": {
        return (
          <>
            <Image
              source={ImagePath.logo}
              resizeMode="contain"
              style={[s.selfCenter, s.my4, { width: 156, height: 156 }]}
            />
            <Text style={[s.header]}>
              {t("onboarding_screen.block2.header")}
            </Text>
            <Text style={[s.subheader]}>
              {t("onboarding_screen.block2.body")}
            </Text>
            {featureReminders ? null : (
              <Link style={[s.button]} href={Routes.thoughtCreateV2()}>
                <TouchableOpacity style={[s.flex1]}>
                  <Text style={[s.buttonText]}>
                    {t("onboarding_screen.reminders.button.continue")}
                  </Text>
                </TouchableOpacity>
              </Link>
            )}
          </>
        );
      }
      case "reminders": {
        return (
          <>
            <Image
              source={ImagePath.notifications}
              resizeMode="contain"
              style={[s.selfCenter, s.my4, { width: 256, height: 196 }]}
            />
            <Text style={[s.header]}>
              {t("onboarding_screen.reminders.header")}
            </Text>
            <TouchableOpacity style={[s.button]}>
              <Text style={[s.buttonText]}>
                {t("onboarding_screen.reminders.button.yes")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.button]}>
              <Text style={[s.buttonText]}>
                {t("onboarding_screen.reminders.button.no")}
              </Text>
            </TouchableOpacity>
            {/* <Text style={[s.header]}> */}
            {/* {t("onboarding_screen.reminders.disabled")} */}
            {/* </Text> */}
            {/* <TouchableOpacity style={[s.button]}> */}
            {/* <Text style={[s.buttonText]}> */}
            {/* {t("onboarding_screen.reminders.button.continue")} */}
            {/* </Text> */}
            {/* </TouchableOpacity> */}
          </>
        );
      }
      default:
        throw new Error(`unknown slide: ${item satisfies never}`);
    }
  };
}
