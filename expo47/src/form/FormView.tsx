import { ActionButton } from "../ui"
import React from "react"
import Carousel from "react-native-reanimated-carousel"
import { View, Keyboard } from "react-native"
import { sliderWidth } from "./sizes"
import * as Distortion from "../io-ts/distortion"
import AutomaticThought from "./AutomaticThought"
import AlternativeThought from "./AlternativeThought"
import Challenge from "./Challenge"
import Distortions from "./Distortions"
import i18n from "../i18n"
import { CarouselRenderItemInfo } from "react-native-reanimated-carousel/lib/typescript/types"

const slideToIndex = {
  automatic: 0,
  distortions: 1,
  challenge: 2,
  alternative: 3,
}

export type Slides = keyof typeof slideToIndex

interface FormViewProps {
  onSave: () => void
  automatic: string
  alternative: string
  challenge: string
  distortions: Set<Distortion.Distortion>
  slideToShow: Slides
  shouldShowInFlowOnboarding: boolean
  onChangeAutomaticThought: (val: string) => void
  onChangeChallenge: (val: string) => void
  onChangeAlternativeThought: (val: string) => void
  onChangeDistortion: (selected: string) => void
}

export default function FormView(props: FormViewProps): React.JSX.Element {
  function _renderItem(
    item: CarouselRenderItemInfo<string>
  ): React.JSX.Element {
    switch (item.item) {
      case "automatic-thought":
        return (
          <AutomaticThought
            value={props.automatic}
            onChange={props.onChangeAutomaticThought}
          />
        )
      case "distortions":
        return (
          <Distortions
            selected={props.distortions}
            onChange={props.onChangeDistortion}
          />
        )
      case "challenge":
        return (
          <Challenge
            value={props.challenge}
            onChange={props.onChangeChallenge}
          />
        )
      case "alternative-thought":
        return (
          <>
            <AlternativeThought
              value={props.alternative}
              onChange={props.onChangeAlternativeThought}
            />

            <View
              style={{
                marginTop: 12,
              }}
            >
              <ActionButton
                title={i18n.t("cbt_form.submit")}
                width="100%"
                onPress={props.onSave}
              />
            </View>
          </>
        )
      default:
        return <View />
    }
  }

  return (
    <Carousel
      data={[
        "automatic-thought",
        "distortions",
        "challenge",
        "alternative-thought",
      ]}
      renderItem={_renderItem}
      width={sliderWidth}
      onSnapToItem={(index) => {
        Keyboard.dismiss()
      }}
      loop={false}
      defaultIndex={slideToIndex[props.slideToShow]}
      mode="parallax"
      modeConfig={{
        parallaxScrollingScale: 0.9,
        parallaxScrollingOffset: Math.round(sliderWidth * 0.15),
      }}
      // fix vertical scrolling for distortions
      onConfigurePanGesture={(gesture) => {
        "worklet"
        gesture.activeOffsetX([-10, 10])
      }}
    />
  )
}
