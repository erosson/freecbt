import { Routes } from "@/src";
import * as AsyncState from "@/src/legacy/async-state";
import CBTView from "@/src/legacy/form/CBTView";
import { Slides } from "@/src/legacy/form/FormView";
import haptic from "@/src/legacy/haptic";
import i18n from "@/src/legacy/i18n";
import { Thought } from "@/src/legacy/io-ts/thought";
import * as ThoughtStore from "@/src/legacy/io-ts/thought/store";
import theme from "@/src/legacy/theme";
import {
  ActionButton,
  Container,
  Header,
  IconButton,
  Row,
} from "@/src/legacy/ui";
import Constants from "expo-constants";
import * as Haptic from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Linking, ScrollView, StatusBar, Text, View } from "react-native";

function ParseErrorView(props: {
  error: ThoughtStore.ParseError;
}): React.JSX.Element {
  const subject = "Parse Error";
  // cause: ${props.error.error.cause}
  const body = `uuid: ${props.error.id}

error: ${props.error.error}

json: ${props.error.raw}`;
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
            );
          }}
        />
      </Row>
    </ScrollView>
  );
}

export default function CBTViewScreen(): React.JSX.Element {
  const router = useRouter();
  const { id: thoughtID } = useLocalSearchParams<{ id: string }>();
  const thought: AsyncState.RemoteData<Thought, ThoughtStore.ParseError> =
    AsyncState.useAsyncResultState(() => ThoughtStore.readResult(thoughtID));

  function onEdit(_: string, slide: Slides) {
    if (AsyncState.isSuccess(thought)) {
      router.navigate(Routes.thoughtEdit(thought.value.uuid, { slide }));
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
              haptic.impact(Haptic.ImpactFeedbackStyle.Light);
              router.navigate(Routes.thoughtList());
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
                haptic.impact(Haptic.ImpactFeedbackStyle.Light);
                router.navigate(Routes.thoughtCreate());
              }}
            />
          )
        )}
      </Container>
    </View>
  );
}
