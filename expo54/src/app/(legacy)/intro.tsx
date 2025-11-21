import Constants from "expo-constants";
import * as Haptic from "expo-haptics";
import React from "react";
import { Alert, Dimensions, Image, Linking, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
// import { FadesIn } from "@/src/legacy/animations";
import { Routes } from "@/src";
import * as Feature from "@/src/legacy/feature";
import haptic from "@/src/legacy/haptic";
import i18n from "@/src/legacy/i18n";
import { Screen, ScreenProps } from "@/src/legacy/screens";
import theme from "@/src/legacy/theme";
import {
  ActionButton,
  Container,
  Header,
  Paragraph,
  Row,
} from "@/src/legacy/ui";
import { useRouter } from "expo-router";
import { setNotifications } from "./settings";

type Props = ScreenProps<Screen.ONBOARDING>;

const RecordStep = () => (
  <View
    style={{
      height: "100%",
      justifyContent: "center",
      flex: 1,
    }}
  >
    <Image
      source={require("@/assets/looker/Looker.png")}
      style={{
        width: 156,
        height: 156,
        resizeMode: "contain",
        alignSelf: "center",
        marginBottom: 48,
      }}
    />
    <Header
      style={{
        fontSize: 28,
      }}
    >
      {i18n.t("onboarding_screen.readme")}
    </Header>
    <ActionButton
      flex={1}
      width="100%"
      title={i18n.t("onboarding_screen.header")}
      fillColor="#EDF0FC"
      textColor={theme.darkBlue}
      onPress={() => {
        const url = "https://freecbt.erosson.org/explanation?ref=quirk";
        Linking.canOpenURL(url).then((canOpen) => {
          if (!canOpen) {
            Alert.alert(
              "You can't open this",
              `We're not sure why, but your phone is telling us that you can't open this link. You can find it at '${url}'`
            );
          }
          Linking.openURL(url);
        });
      }}
    />
  </View>
);

const ChallengeStep = () => (
  <View
    style={{
      height: "100%",
      justifyContent: "center",
      flex: 1,
    }}
  >
    <Image
      source={require("@/assets/eater/eater.png")}
      style={{
        width: 156,
        height: 156,
        resizeMode: "contain",
        alignSelf: "center",
        marginBottom: 48,
      }}
    />
    <Header
      style={{
        fontSize: 28,
      }}
    >
      {i18n.t("onboarding_screen.block1.header")}
    </Header>
    <Paragraph
      style={{
        fontSize: 20,
      }}
    >
      {i18n.t("onboarding_screen.block1.body")}
    </Paragraph>
  </View>
);

const ChangeStep = () => (
  <View
    style={{
      height: "100%",
      justifyContent: "center",
      flex: 1,
    }}
  >
    <Image
      source={require("@/assets/logo/logo.png")}
      style={{
        width: 156,
        height: 156,
        resizeMode: "contain",
        alignSelf: "center",
        marginBottom: 48,
      }}
    />
    <Header
      style={{
        fontSize: 28,
      }}
    >
      {i18n.t("onboarding_screen.block2.header")}
    </Header>
    <Paragraph
      style={{
        fontSize: 20,
      }}
    >
      {i18n.t("onboarding_screen.block2.body")}
    </Paragraph>
  </View>
);

const RemindersStep = ({ onContinue }: { onContinue: () => void }) => {
  const { feature } = React.useContext(Feature.Context);
  return (
    <View
      style={{
        height: "100%",
        justifyContent: "center",
        flex: 1,
      }}
    >
      <Image
        source={require("@/assets/notifications/notifications.png")}
        style={{
          width: 256,
          height: 196,
          resizeMode: "contain",
          alignSelf: "center",
          marginBottom: 48,
        }}
      />
      <Header
        style={{
          fontSize: 28,
          marginBottom: 12,
        }}
      >
        {feature.reminders
          ? i18n.t("onboarding_screen.reminders.header")
          : i18n.t("onboarding_screen.reminders.disabled")}
      </Header>
      {feature.reminders ? (
        <>
          <Row
            style={{
              marginBottom: 8,
            }}
          >
            <ActionButton
              flex={1}
              width="100%"
              title={i18n.t("onboarding_screen.reminders.button.yes")}
              onPress={async () => {
                await setNotifications(feature, true);
              }}
            />
          </Row>
          <Row>
            <ActionButton
              flex={1}
              width="100%"
              title={i18n.t("onboarding_screen.reminders.button.no")}
              fillColor="#EDF0FC"
              textColor={theme.darkBlue}
              onPress={onContinue}
            />
          </Row>
        </>
      ) : (
        <Row>
          <ActionButton
            flex={1}
            width="100%"
            title={i18n.t("onboarding_screen.reminders.button.continue")}
            fillColor="#EDF0FC"
            textColor={theme.darkBlue}
            onPress={onContinue}
          />
        </Row>
      )}
    </View>
  );
};

export default function OnboardingScreen(): React.JSX.Element {
  const router = useRouter();
  const [slide, setSlide] = React.useState<number>(0);
  function stopOnBoarding() {
    haptic.notification(Haptic.NotificationFeedbackType.Success);
    router.navigate(Routes.thoughtCreate({ fromIntro: true }));
  }

  function renderItem({ item }: { item: string }): React.JSX.Element {
    switch (item) {
      case "record":
        return <RecordStep />;
      case "challenge":
        return <ChallengeStep />;
      case "change":
        return <ChangeStep />;
      case "reminders-or-continue":
        return <RemindersStep onContinue={stopOnBoarding} />;
      default:
        return <View />;
    }
  }

  const { width, height } = Dimensions.get("window");
  return (
    <Container
      style={{
        height: "100%",
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: Constants.statusBarHeight + 12,
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        paddingBottom: 0,
      }}
    >
      {/* <FadesIn pose="visible"> */}
      <Carousel
        // width={sliderWidth}
        // height={Dimensions.get('window').width / 2}
        width={width}
        height={height}
        data={["record", "challenge", "change", "reminders-or-continue"]}
        renderItem={renderItem}
        onSnapToItem={setSlide}
        loop={false}
        pagingEnabled={true}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: Math.round(width * 0.15),
        }}
      />
      {/* </FadesIn> */}
    </Container>
  );
}
