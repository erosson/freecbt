import React from "react";
import theme from "../theme";
import { IconButton, Paragraph, SubHeader } from "../ui";
// import posed from "react-native-pose"
import * as Haptic from "expo-haptics";
import { sortBy } from "lodash";
import { TouchableWithoutFeedback, View } from "react-native";
import * as AsyncState from "../async-state";
import universalHaptic from "../haptic";
import {
  hiddenAlerts,
  hide,
  hideMultipleAlerts,
  isNewUser,
} from "./alertstore";

//const PopsUp = posed.View({
//  full: { height: 380, paddingTop: 18, paddingBottom: 18 },
//  peak: {
//    height: 156,
//    paddingTop: 18,
//    paddingBottom: 18,
//    transition: { type: "spring", stiffness: 150 },
//  },
//  hidden: { height: 0, paddingTop: 0, paddingBottom: 0 },
//})
const PopsUp = View;

interface AlertViewProps {
  title: string;
  body: string;
  onHide: () => void;
}

function AlertView(props: AlertViewProps): React.JSX.Element {
  const [view, setView] = React.useState("hidden");
  React.useEffect(() => {
    setTimeout(() => {
      setView("peak");
      universalHaptic.notification(Haptic.NotificationFeedbackType.Success);
    }, 350);
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setView("full");
      }}
    >
      <PopsUp
        // pose={view}
        style={{
          position: "absolute",
          width: "100%",
          height: 256,
          padding: 24,
          bottom: 24,
          borderRadius: 13,
          backgroundColor: "white",
          borderColor: theme.lightGray,
          borderWidth: 2,
          shadowColor: theme.lightGray,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 10,
          shadowOpacity: 0.8,
          opacity: 1,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <SubHeader
            style={{
              height: 48,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              lineHeight: 48,
              marginBottom: 0,
              fontSize: 24,
            }}
          >
            {props.title}
          </SubHeader>
          <IconButton
            featherIconName="x"
            accessibilityLabel="close"
            onPress={() => {
              setView("hidden");
              props.onHide();
            }}
          />
        </View>
        <Paragraph>{props.body}</Paragraph>
      </PopsUp>
    </TouchableWithoutFeedback>
  );
}

export interface Alert {
  title: string;
  body: string;
  slug: string;

  // Increase this number for newer alerts if you'd like
  priority: 0;
}

interface AlerterProps {
  alerts: Alert[];
}

export default function Alerter(props: AlerterProps): React.JSX.Element | null {
  const [shown, setShown] = React.useState<Alert | null>(null);

  AsyncState.useAsyncEffect(async () => {
    // If someone is a new user, just go ahead and hide
    // all anouncements. They can just see the app as it is
    if (await isNewUser()) {
      await hideMultipleAlerts(props.alerts.map(({ slug }) => slug));
      return;
    } else {
      const hidden = await hiddenAlerts();
      const showableAlerts = sortBy(props.alerts, ["priority"]).filter(
        ({ slug }) => !hidden.includes(slug)
      );
      setShown(showableAlerts[0]);
    }
  });

  if (!shown) {
    return null;
  }

  return (
    <AlertView
      title={shown.title}
      body={shown.body}
      onHide={() => hide(shown.slug)}
    />
  );
}
