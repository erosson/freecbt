import React from "react"
import {
  ScrollView,
  View,
  Linking,
  TouchableOpacity,
  BackHandler,
  Text,
} from "react-native"
import Constants from "expo-constants"
import * as Haptic from "expo-haptics"
import theme from "../theme"
import { Screen, ScreenProps } from "../screens"
import i18n from "../i18n"
import * as Bubbles from "../imgs/Bubbles"
import haptic from "../haptic"
import * as D from "../io-ts/distortion"
import * as Feature from "../feature"
import * as Style from "../style"
import { Feather } from "@expo/vector-icons"

type Props = ScreenProps<Screen.EXPLANATION>

function Distortion(props: {
  index: number
  distortion: D.Distortion
  selected: boolean
  toggle: (d: D.Distortion) => void
}): React.JSX.Element {
  const style = Style.useStyle()
  const selectable = Feature.useFeature.extendedDistortions()
  const selected = selectable && props.selected
  const d = props.distortion
  const bubble = Bubbles.colors[props.index % Bubbles.colors.length]
  const onPress = () => props.toggle(d)

  const body = (
    <>
      <Text style={selected ? [style.selectedSubheader] : [style.subheader]}>
        {d.label()} {d.emoji()}{" "}
        {selected ? (
          <Feather name="check" size={16} style={style.selectedText} />
        ) : null}
      </Text>

      {d.explanation().map((b, i) => (
        <Text
          key={i}
          style={selected ? [style.selectedParagraph] : [style.paragraph]}
        >
          {i === 0 ? "" : "\n"}
          {b}
        </Text>
      ))}

      <Bubbles.SelectableThought color={bubble} selected={selected}>
        {d.explanationThought()}
      </Bubbles.SelectableThought>
    </>
  )

  const styl = { marginBottom: 48 }
  if (!selectable) {
    return <View style={[style.view, styl]}>{body}</View>
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      style={
        selected
          ? [style.selectedBorder, style.selectedView, styl]
          : [style.border, style.view, styl]
      }
    >
      {body}
    </TouchableOpacity>
  )
}

export default function ExplanationScreen(props: Props): React.JSX.Element {
  const style = Style.useStyle()
  const [selected, setSelected] = React.useState<Set<D.Distortion>>(
    new Set(props.route.params.distortions.map((d) => D.bySlug[d]))
  )

  function onBack() {
    onClose()
    return true
  }
  React.useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack)
    return () => sub.remove()
  })

  function navigateToOnboardingScreen() {
    props.navigation.navigate(Screen.ONBOARDING)
  }
  function onClose() {
    haptic.impact(Haptic.ImpactFeedbackStyle.Light)
    // props.navigation.pop()
    props.navigation.navigate({
      name: Screen.CBT_FORM,
      params: { distortions: Array.from(selected).map((d) => d.slug) },
      merge: true,
    })
  }
  function toggle(d: D.Distortion) {
    const ret = new Set(selected)
    if (ret.has(d)) {
      ret.delete(d)
    } else {
      ret.add(d)
    }
    return setSelected(ret)
  }

  return (
    <ScrollView
      style={[
        style.view,
        {
          marginTop: Constants.statusBarHeight,
          paddingTop: 24,
          paddingLeft: 24,
          paddingRight: 24,
        },
      ]}
    >
      <View
        style={{
          marginBottom: Constants.statusBarHeight + 24,
        }}
      >
        <View
          style={{
            marginBottom: 24,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={style.header}
            textBreakStrategy="simple"
            allowFontScaling={false}
          >
            {i18n.t("explanation_screen.header")}
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                marginRight: 8,
              }}
            >
              <TouchableOpacity
                style={[
                  style.button,
                  {
                    width: 80,
                    height: 48,
                    padding: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    maxHeight: 48,
                  },
                ]}
                onPress={navigateToOnboardingScreen}
              >
                <Text
                  style={[
                    style.text,
                    {
                      textAlign: "center",
                      fontWeight: "700",
                    },
                  ]}
                >
                  {i18n.t("explanation_screen.intro")}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                style.button,
                {
                  height: 48,
                  width: 48,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                  position: "relative",
                },
              ]}
              accessibilityLabel={i18n.t("accessibility.new_thought_button")}
              onPress={onClose}
            >
              <Feather name="x" size={24} style={style.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            marginBottom: 24,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={[
              style.buttonAction,
              {
                flex: 1,
                padding: 12,
                borderRadius: 10,
                // @ts-ignore
                textAlign: "center",
                justifyContent: "center",
                alignItems: "center",
                maxHeight: 48,
              },
            ]}
            onPress={() => {
              const url = "https://freecbt.erosson.org/explanation?ref=quirk"
              Linking.canOpenURL(url).then(() => Linking.openURL(url))
            }}
          >
            <Text
              style={[
                style.textAction,
                {
                  fontWeight: "700",
                  fontSize: 16,
                },
              ]}
            >
              {i18n.t("onboarding_screen.header")}
            </Text>
          </TouchableOpacity>
        </View>

        {D.sortedBySlug.map((d, i) => (
          <Distortion
            key={d.slug}
            index={i}
            distortion={d}
            selected={selected.has(d)}
            toggle={toggle}
          />
        ))}
      </View>
    </ScrollView>
  )
}
