import { PromiseRender } from "@/src/hooks/use-promise-state";
import * as Feature from "@/src/legacy/feature";
import { hasPincode } from "@/src/legacy/lockstore";
import LockScreen from "@/src/legacy/screen/LockScreen";
import * as Style from "@/src/legacy/style";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Feature.State>
        <Style.State>
          <AuthState>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthState>
        </Style.State>
      </Feature.State>
    </GestureHandlerRootView>
  );
}

function AuthState(props: { children: React.ReactNode }): React.JSX.Element {
  const [p, setHasPincode] = useState<Promise<boolean>>(hasPincode());
  const [authed, setAuthed] = useState<boolean>(false);
  // remove auth if the app is in the background, because it's easy to not close it all the way
  useEffect(() => {
    AppState.addEventListener("change", (st) => {
      if (st !== "active") {
        setAuthed(false);
        // also, refresh has-pincode: we might have changed settings after the app was loaded
        setHasPincode(hasPincode());
      }
    });
  });
  return (
    <PromiseRender
      promise={p}
      pending={() => <></>}
      failure={(e) => <Text>error: {e.message}</Text>}
      success={(p) => {
        if (p) {
          // a pincode is required. have we already entered it?
          if (authed) {
            return props.children;
          } else {
            return (
              <LockScreen
                isSettingCode={false}
                onCorrectEntry={() => setAuthed(true)}
              />
            );
          }
        } else {
          // no pincode is required
          return props.children;
        }
      }}
    />
  );
}
