import * as Feature from "@/src/legacy/feature";
import { isPlatformSupported } from "@/src/legacy/legacy-util";
import BackupScreen from "@/src/legacy/screen/BackupScreen";
import CBTListScreen from "@/src/legacy/screen/CBTListScreen";
import CBTViewScreen from "@/src/legacy/screen/CBTViewScreen";
import DebugScreen from "@/src/legacy/screen/DebugScreen";
import ExplanationScreen from "@/src/legacy/screen/ExplanationScreen";
import ExportScreen from "@/src/legacy/screen/ExportScreen";
import CBTFormScreen from "@/src/legacy/screen/FormScreen";
import InitScreen from "@/src/legacy/screen/InitScreen";
import LockScreen from "@/src/legacy/screen/LockScreen";
import OnboardingScreen from "@/src/legacy/screen/OnboardingScreen";
import SettingScreen from "@/src/legacy/screen/SettingsScreen";
import { ParamList, Screen } from "@/src/legacy/screens";
import * as Style from "@/src/legacy/style";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator<ParamList>();

export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={Screen.INIT}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name={Screen.CBT_FORM} component={CBTFormScreen} />
          <Stack.Screen name={Screen.CBT_LIST} component={CBTListScreen} />
          <Stack.Screen name={Screen.ONBOARDING} component={OnboardingScreen} />
          <Stack.Screen
            name={Screen.EXPLANATION}
            component={ExplanationScreen}
          />
          <Stack.Screen name={Screen.SETTING} component={SettingScreen} />
          <Stack.Screen name={Screen.INIT} component={InitScreen} />
          <Stack.Screen name={Screen.CBT_VIEW} component={CBTViewScreen} />
          <Stack.Screen name={Screen.BACKUP} component={BackupScreen} />
          <Stack.Screen name={Screen.EXPORT} component={ExportScreen} />
          <Stack.Screen name={Screen.LOCK} component={LockScreen} />
          <Stack.Screen
            name={Screen.DEBUG}
            component={DebugScreen}
            options={{ headerShown: true, title: "" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

function Root() {
  if (!isPlatformSupported()) {
    // web platform + asyncstorage failure
    return <Text>unsupported legacy platform</Text>;
  }
  return Feature.withState(Style.withState(App))();
}
export default Root;
