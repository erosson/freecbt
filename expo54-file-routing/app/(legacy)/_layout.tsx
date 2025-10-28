import * as Feature from "@/src/legacy/feature";
import * as Style from "@/src/legacy/style";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Feature.State>
        <Style.State>
          <Stack screenOptions={{ headerShown: false }} />
        </Style.State>
      </Feature.State>
    </GestureHandlerRootView>
  );
}
