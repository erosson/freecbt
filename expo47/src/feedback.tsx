import React from "react"
import * as StoreReview from "react-native-store-review"
import { View, Linking, Platform, Text } from "react-native"
import { SubHeader, Row, ActionButton } from "./ui"
import theme from "./theme"
import * as flagstore from "./flagstore"
import * as AsyncState from "./async-state"
import { countThoughts } from "./thoughtstore"

const PLAY_STORE_URL =
  "http://play.google.com/store/apps/details?id=org.erosson.freecbt"

async function shouldShowRatingComponent(): Promise<boolean> {
  if (
    Platform.OS === "android" &&
    !(await Linking.canOpenURL(PLAY_STORE_URL))
  ) {
    return false
  }

  // Don't show if they've rated before
  const hasRatedBefore = await flagstore.get("has-rated", "false")
  if (hasRatedBefore) {
    console.log("has rated before isn't available")
    return false
  }

  // Mainly show to power users
  const count = await countThoughts()
  if (count < 4) {
    return false
  }

  return true
}

export default function Feedback(): JSX.Element | null {
  const shouldShowRate = AsyncState.useAsyncState<boolean>(
    shouldShowRatingComponent
  )

  async function onRate() {
    if (Platform.OS === "ios") {
      StoreReview.requestReview()
    } else if (Platform.OS === "android") {
      await Linking.openURL(
        "http://play.google.com/store/apps/details?id=org.erosson.freecbt"
      )
    }

    await flagstore.setTrue("has-rated")
  }

  return AsyncState.fold(
    shouldShowRate,
    () => null,
    () => null,
    (error) => <Text>{error}</Text>,
    (visible) => (
      <View
        style={{
          marginTop: 18,
          borderRadius: 8,
          paddingBottom: 96,
        }}
      >
        <SubHeader
          style={{
            alignSelf: "flex-start",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          {visible ? "Something Wrong?" : "Got Feedback?"}
        </SubHeader>
        <Row
          style={{
            alignSelf: "flex-start",
            justifyContent: "center",
          }}
        >
          <ActionButton
            fillColor={theme.lightGray}
            textColor={theme.blue}
            title={"Let us know"}
            width={"100%"}
            onPress={() => {
              Linking.openURL("mailto:freecbt@erosson.org")
            }}
          />
        </Row>

        {visible && (
          <>
            <SubHeader
              style={{
                alignSelf: "flex-start",
                justifyContent: "center",
                marginTop: 18,
              }}
            >
              Love FreeCBT?
            </SubHeader>
            <Row
              style={{
                alignSelf: "flex-start",
                justifyContent: "center",
              }}
            >
              <ActionButton
                fillColor={theme.lightGray}
                textColor={theme.blue}
                title={"Give it a review 🙏"}
                width={"100%"}
                onPress={onRate}
              />
            </Row>
          </>
        )}
      </View>
    )
  )
}
