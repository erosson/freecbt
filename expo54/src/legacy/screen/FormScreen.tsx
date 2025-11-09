import { Routes } from "@/src";
import Constants from "expo-constants";
import * as Haptic from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";
import * as AsyncState from "../async-state";
import * as flagstore from "../flagstore";
import FormView, { Slides } from "../form/FormView";
import haptic from "../haptic";
import i18n from "../i18n";
import * as Distortion from "../io-ts/distortion";
import * as Thought from "../io-ts/thought";
import * as ThoughtStore from "../io-ts/thought/store";
import { getIsExistingUser, setIsExistingUser } from "../io-ts/thought/store";
import { Container, Header, IconButton, Row } from "../ui";

interface Props {
  thoughtID?: string;
  fromIntro?: boolean;
  initDistortions?: readonly string[];
  initSlide?: string;
}

export default function FormScreen(props: Props = {}): React.JSX.Element {
  const router = useRouter();
  const { thoughtID, initDistortions, initSlide } = props;
  const fromIntro = props.fromIntro ?? false;
  const showHelpBadge = AsyncState.useAsyncState(() =>
    flagstore.get("start-help-badge", "true")
  );

  const [automatic, setAutomatic] = React.useState("");
  const [alternative, setAlternative] = React.useState("");
  const [challenge, setChallenge] = React.useState("");
  const [distortions, setDistortions] = React.useState(
    new Set<Distortion.Distortion>([])
  );
  // TODO loading spinner
  const thought0 =
    AsyncState.useAsyncState<Thought.Thought | null>(async () => {
      if (thoughtID) {
        const thought = await ThoughtStore.read(thoughtID);
        setAutomatic(thought.automaticThought);
        setAlternative(thought.alternativeThought);
        setChallenge(thought.challenge);
        setDistortions(thought.cognitiveDistortions);
        return thought;
      }
      return null;
    }, [thoughtID]);
  React.useEffect(() => {
    if (initDistortions) {
      setDistortions(new Set(initDistortions.map((d) => Distortion.bySlug[d])));
    }
  }, [initDistortions]);

  // `slide` is set from props on init, props on update, or setSlide in this file
  const [slide, setSlide] = React.useState<Slides>(
    (initSlide as Slides) ?? "automatic"
  );
  React.useEffect(() => {
    if (initSlide) {
      setSlide(initSlide as Slides);
    }
  }, [initSlide]);

  // redirect to onboarding if this is the first time opening the app
  AsyncState.useAsyncEffect(async () => {
    if (!(await getIsExistingUser())) {
      await setIsExistingUser();
      router.replace(Routes.intro());
    }
  });

  async function onSave() {
    const args = {
      automaticThought: automatic,
      alternativeThought: alternative,
      challenge: challenge,
      cognitiveDistortions: distortions,
    };
    const thought0_: Thought.Thought | null = AsyncState.withDefault(
      thought0,
      null
    );
    const thought: Thought.Thought = thought0_
      ? { ...thought0_, ...args, updatedAt: new Date() }
      : Thought.create(args);
    await ThoughtStore.write(thought);
    haptic.notification(Haptic.NotificationFeedbackType.Success);
    router.navigate(Routes.thoughtView(Thought.key(thought)));
    setSlide("automatic");
  }

  function onChangeDistortion(selected: string) {
    haptic.selection(); // iOS users get a selected buzz
    const d = Distortion.bySlug[selected];
    const ds = new Set(distortions);
    // toggle
    ds.has(d) ? ds.delete(d) : ds.add(d);
    setDistortions(ds);
  }

  return (
    //<FadesIn
    //  style={{
    //    backgroundColor: theme.lightOffwhite,
    //    height: "100%",
    //  }}
    //  pose="visible"
    //>
    <>
      <StatusBar barStyle="dark-content" />
      <Container
        style={{
          height: "100%",
          paddingLeft: 0,
          paddingRight: 0,
          marginTop: Constants.statusBarHeight,
          paddingTop: 12,
          paddingBottom: 0,
        }}
      >
        <Row
          style={{
            marginBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <IconButton
            featherIconName={"help-circle"}
            accessibilityLabel={i18n.t("accessibility.help_button")}
            onPress={async () => {
              await flagstore.setFalse("start-help-badge");
              router.navigate(
                Routes.help({
                  distortions: Array.from(distortions).map((d) => d.slug),
                })
              );
            }}
            hasBadge={AsyncState.withDefault(showHelpBadge, false)}
          />
          <Header allowFontScaling={false}>{i18n.t("cbt_form.header")}</Header>
          <IconButton
            accessibilityLabel={i18n.t("accessibility.list_button")}
            featherIconName={"list"}
            onPress={() => {
              router.navigate(Routes.thoughtList());
            }}
          />
        </Row>
        <FormView
          onSave={onSave}
          automatic={automatic}
          alternative={alternative}
          challenge={challenge}
          distortions={distortions}
          slideToShow={slide}
          shouldShowInFlowOnboarding={fromIntro}
          onChangeAlternativeThought={setAlternative}
          onChangeAutomaticThought={setAutomatic}
          onChangeChallenge={setChallenge}
          onChangeDistortion={onChangeDistortion}
        />
      </Container>
    </>
    // </FadesIn>
  );
}
