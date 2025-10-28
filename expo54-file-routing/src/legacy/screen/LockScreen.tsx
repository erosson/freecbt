import React from "react"
import { StatusBar } from "react-native"
import { Container, Row, GhostButton, Header, IconButton } from "../ui"
import theme from "../theme"
import Constants from "expo-constants"
import * as Haptic from "expo-haptics"
import { FadesIn, BouncyBigOnActive } from "../animations"
import { isCorrectPincode, setPincode } from "../lockstore"
import { Screen, ScreenProps } from "../screens"
import haptic from "../haptic"
import * as AsyncState from "../async-state"

type Props = ScreenProps<Screen.LOCK>

const KeypadButton = ({
  title,
  onPress,
  style = {},
}: {
  title: string
  onPress: () => void
  style?: { [s: string]: string }
}) => (
  <GhostButton
    title={title}
    borderColor={theme.gray}
    textColor={theme.darkText}
    width={BUTTON_SIZE}
    height={BUTTON_SIZE}
    fontSize={18}
    style={{
      backgroundColor: "white",
      ...style,
    }}
    onPress={onPress}
  />
)

const KeypadSideButton = ({
  icon,
  accessibilityLabel,
  onPress,
  style = {},
}: {
  icon: string
  accessibilityLabel: string
  onPress: () => void
  style?: { [s: string]: string }
}) => (
  <IconButton
    accessibilityLabel={accessibilityLabel}
    featherIconName={icon}
    style={{
      backgroundColor: "white",
      width: BUTTON_SIZE,
      ...style,
    }}
    onPress={onPress}
  />
)

const Notifier = ({ isActive }: { isActive: boolean }) => (
  <BouncyBigOnActive
    style={{
      width: 32,
      height: 32,
      borderRadius: 32,
      backgroundColor: theme.pink,
      borderColor: theme.darkPink,
      borderWidth: 2,
    }}
    pose={isActive ? "active" : "inactive"}
  />
)

const BUTTON_SIZE = 96

export default function LockScreen(props: Props) {
  const { navigation } = props
  const { isSettingCode } = props.route.params ?? {}
  const [code, setCode] = React.useState<string>("")
  const isComplete = code.length >= 4

  async function onEnterCode(key: string) {
    haptic.impact(Haptic.ImpactFeedbackStyle.Light)
    if (!isComplete) {
      setCode(code + key)
    }
  }

  async function onBackspace() {
    haptic.impact(Haptic.ImpactFeedbackStyle.Medium)
    setCode(code.substring(0, code.length - 1))
  }

  // run when a code is complete
  AsyncState.useAsyncEffect(async () => {
    if (!isComplete) {
      return
    }
    // settings: set a new code
    if (isSettingCode) {
      await setPincode(code)
      haptic.notification(Haptic.NotificationFeedbackType.Success)
      props.navigation.replace(Screen.CBT_FORM)
    }
    // try unlocking the screen
    else {
      const isGood = await isCorrectPincode(code)
      if (isGood) {
        haptic.notification(Haptic.NotificationFeedbackType.Success)
        props.navigation.replace(Screen.CBT_FORM)
      } else {
        setCode("")
        haptic.notification(Haptic.NotificationFeedbackType.Error)
      }
    }
  }, [isComplete])

  return (
    <FadesIn
      style={{
        backgroundColor: theme.pink,
        height: "100%",
      }}
      pose="visible"
    >
      <StatusBar barStyle="dark-content" />
      <Container
        style={{
          flex: 1,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 24,
          marginTop: Constants.statusBarHeight,
          backgroundColor: theme.pink,
          justifyContent: "center",
        }}
      >
        <Row
          style={{
            alignSelf: "center",
          }}
        >
          <Header
            style={{
              fontSize: 32,
              color: "white",
              marginHorizontal: 24,
              textAlign: "center",
            }}
          >
            {isSettingCode
              ? "Please set a passcode"
              : "Please enter your passcode."}
          </Header>
        </Row>
      </Container>

      <Container
        style={{
          flex: 2,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 24,
          backgroundColor: "white",
          borderTopWidth: 2,
          borderColor: theme.darkPink,
        }}
      >
        <Row
          style={{
            marginTop: 32,
            marginLeft: 48,
            marginRight: 48,
            marginBottom: 32,
          }}
        >
          <Notifier isActive={code.length >= 1} />
          <Notifier isActive={code.length >= 2} />
          <Notifier isActive={code.length >= 3} />
          <Notifier isActive={code.length >= 4} />
        </Row>
        <Row
          style={{
            justifyContent: "space-evenly",
            marginBottom: 12,
          }}
        >
          <KeypadButton title="1" onPress={() => onEnterCode("1")} />
          <KeypadButton title="2" onPress={() => onEnterCode("2")} />
          <KeypadButton title="3" onPress={() => onEnterCode("3")} />
        </Row>

        <Row
          style={{
            justifyContent: "space-evenly",
            marginBottom: 12,
          }}
        >
          <KeypadButton title="4" onPress={() => onEnterCode("4")} />
          <KeypadButton title="5" onPress={() => onEnterCode("5")} />
          <KeypadButton title="6" onPress={() => onEnterCode("6")} />
        </Row>

        <Row
          style={{
            justifyContent: "space-evenly",
            marginBottom: 12,
          }}
        >
          <KeypadButton title="7" onPress={() => onEnterCode("7")} />
          <KeypadButton title="8" onPress={() => onEnterCode("8")} />
          <KeypadButton title="9" onPress={() => onEnterCode("9")} />
        </Row>

        <Row
          style={{
            justifyContent: "space-evenly",
          }}
        >
          <KeypadButton title="" onPress={() => null} />
          <KeypadButton title="0" onPress={() => onEnterCode("0")} />
          <KeypadSideButton
            icon="delete"
            accessibilityLabel="back"
            onPress={onBackspace}
          />
        </Row>
      </Container>
    </FadesIn>
  )
}
