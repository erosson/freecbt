import BackupScreen from "@/src/app/(legacy)/backup";
import DebugScreen from "@/src/app/(legacy)/debug";
import ExportScreen from "@/src/app/(legacy)/export";
import ExplanationScreen from "@/src/app/(legacy)/help";
import OnboardingScreen from "@/src/app/(legacy)/intro";
import SettingScreen from "@/src/app/(legacy)/settings";
import CBTListScreen from "@/src/app/(legacy)/thoughts";
import CBTViewScreen from "@/src/app/(legacy)/thoughts/[id]";
import * as Feature from "@/src/legacy/feature";
import { isPlatformSupported } from "@/src/legacy/legacy-util";
import CBTFormScreen from "@/src/legacy/screen/FormScreen";
import InitScreen from "@/src/legacy/screen/InitScreen";
import { ParamList, Screen } from "@/src/legacy/screens";
import * as Style from "@/src/legacy/style";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator<ParamList>();

// TODO not used after expo-router migration, delete me
export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Feature.State>
        <Style.State>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={Screen.INIT}
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name={Screen.CBT_FORM} component={CBTFormScreen} />
              <Stack.Screen name={Screen.CBT_LIST} component={CBTListScreen} />
              <Stack.Screen
                name={Screen.ONBOARDING}
                component={OnboardingScreen}
              />
              <Stack.Screen
                name={Screen.EXPLANATION}
                component={ExplanationScreen}
              />
              <Stack.Screen name={Screen.SETTING} component={SettingScreen} />
              <Stack.Screen name={Screen.INIT} component={InitScreen} />
              <Stack.Screen name={Screen.CBT_VIEW} component={CBTViewScreen} />
              <Stack.Screen name={Screen.BACKUP} component={BackupScreen} />
              <Stack.Screen name={Screen.EXPORT} component={ExportScreen} />
              {/* <Stack.Screen name={Screen.LOCK} component={LockScreen} /> */}
              <Stack.Screen
                name={Screen.DEBUG}
                component={DebugScreen}
                options={{ headerShown: true, title: "" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </Style.State>
      </Feature.State>
    </GestureHandlerRootView>
  );
}

function Root() {
  if (!isPlatformSupported()) {
    // web platform + asyncstorage failure
    return <Text>unsupported legacy platform</Text>;
  }
}
export default Root;
