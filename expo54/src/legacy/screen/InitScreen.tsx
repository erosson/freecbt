import React from "react"
import { View } from "react-native"
import { hasPincode } from "../lockstore"
import { Screen, ScreenProps, NavigationProp } from "../screens"
import { useAsyncEffect } from "../async-state"

type Props = ScreenProps<Screen.INIT>

export default function InitScreen(props: Props): React.JSX.Element {
  useAsyncEffect(async () => {
    // If we're locked, go to the lock instead
    // Check if we should show a pincode
    const isLocked = await hasPincode()
    if (isLocked) {
      props.navigation.replace(Screen.LOCK, { isSettingCode: false })
    } else {
      // We replace here because you shouldn't be able to go "back" to this screen
      props.navigation.replace(Screen.CBT_FORM, {})
    }
  })

  return <View />
}
