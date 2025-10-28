import React from "react"
import {
  Container,
  Row,
  Header,
  IconButton,
  Paragraph,
  ActionButton,
} from "../ui"
import { View, StatusBar, Text, ScrollView, Linking } from "react-native"
import theme from "../theme"
import Constants from "expo-constants"
import * as Haptic from "expo-haptics"
import i18n from "../i18n"
import CBTView from "../form/CBTView"
import { Thought } from "../io-ts/thought"
import * as ThoughtStore from "../io-ts/thought/store"
import haptic from "../haptic"
import { Screen, ScreenProps } from "../screens"
import { Slides } from "../form/FormView"
import * as AsyncState from "../async-state"

type Props = ScreenProps<Screen.CBT_VIEW>

function ParseErrorView(props: {
  error: ThoughtStore.ParseError
}): React.JSX.Element {
  const subject = "Parse Error"
  // cause: ${props.error.error.cause}
  const body = `uuid: ${props.error.id}

error: ${props.error.error}

json: ${props.error.raw}`
  return (
    <ScrollView>
      <Header>{subject}</Header>
      <Text>{body}</Text>
      <Row
        style={{
          alignSelf: "flex-start",
          justifyContent: "center",
        }}
      >
        <ActionButton
          fillColor={theme.lightGray}
          textColor={theme.blue}
          title={"Report this bug"}
          width={"100%"}
          onPress={() => {
            Linking.openURL(
              `mailto:freecbt@erosson.org?subject=${encodeURIComponent(
                `[FreeCBT] ${subject}`
              )}&body=${encodeURIComponent(
                `Feel free to add your comments here: \n\n\n\n\n\n\n---\nPlease don't change below this line!\n\n${body}`
              )}`
            )
          }}
        />
      </Row>
    </ScrollView>
  )
}

export default function CBTViewScreen(props: Props): React.JSX.Element {
  const thought: AsyncState.RemoteData<Thought, ThoughtStore.ParseError> =
    AsyncState.useAsyncResultState(() =>
      ThoughtStore.readResult(props.route.params.thoughtID)
    )

  function onEdit(_: string, slide: Slides) {
    if (AsyncState.isSuccess(thought)) {
      props.navigation.push(Screen.CBT_FORM, {
        thoughtID: thought.value.uuid,
        slide,
      })
    }
  }

  return (
    <View
      style={{
        backgroundColor: theme.lightOffwhite,
        height: "100%",
      }}
    >
      <StatusBar barStyle="dark-content" />
      <Container
        style={{
          height: "100%",
          paddingLeft: 0,
          paddingRight: 0,
          marginTop: Constants.statusBarHeight,
          paddingTop: 12,
        }}
      >
        <Row
          style={{
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <Header allowFontScaling={false}>
            {i18n.t("finished_screen.header")}
          </Header>
          <IconButton
            accessibilityLabel={i18n.t("accessibility.close_button")}
            featherIconName={"x"}
            onPress={() => {
              haptic.impact(Haptic.ImpactFeedbackStyle.Light)
              props.navigation.push(Screen.CBT_LIST)
            }}
          />
        </Row>

        {AsyncState.fold(
          thought,
          () => null,
          () => null,
          (error) => (
            <ParseErrorView error={error} />
          ),
          (t) => (
            <CBTView
              thought={t}
              onEdit={onEdit}
              onNew={() => {
                haptic.impact(Haptic.ImpactFeedbackStyle.Light)
                props.navigation.push(Screen.CBT_FORM, {})
              }}
            />
          )
        )}
      </Container>
    </View>
  )
}
