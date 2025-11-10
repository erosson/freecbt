import {
  LoadModel,
  ModelI18nProvider,
  ModelLoadedProps,
  ModelProvider,
} from "@/src/hooks/use-model";
import { Action } from "@/src/model";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState, Button, Text, TextInput, View } from "react-native";

export default function Layout() {
  return (
    <ModelProvider>
      <ModelI18nProvider>
        <AuthGateway>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthGateway>
      </ModelI18nProvider>
    </ModelProvider>
  );
}

function AuthGateway(props: { children: React.ReactNode }): React.JSX.Element {
  return (
    <LoadModel
      ready={(lprops) => <AuthReady {...lprops}>{props.children}</AuthReady>}
    />
  );
}
function AuthReady(props: ModelLoadedProps & { children: React.ReactNode }) {
  const { model, dispatch, style: s, translate: t } = props;
  const [value, setValue] = useState<string>("");

  function onChangeText(newValue: string) {
    // numbers only
    setValue(newValue.replace(/[^0-9]/g, ""));
  }
  function onSubmit() {
    // reset text entry. this won't matter if auth succeeds
    setValue("");
    if (value === model.settings.pincode) {
      // successful auth
      dispatch(Action.setSessionAuthed(true));
    }
  }
  // remove auth if the app is in the background, because it's easy to not close it all the way
  useEffect(() => {
    AppState.addEventListener("change", (st) => {
      if (st !== "active") {
        dispatch(Action.setSessionAuthed(false));
      }
    });
  });
  if (model.settings.pincode === null || model.sessionAuthed) {
    return props.children;
  } else {
    return (
      <View style={[s.centeredView]}>
        <View style={[s.container, s.itemsCenter]}>
          <Text style={[s.header]}>{t("lock_screen.auth")}</Text>
          <TextInput
            style={[s.bg, s.border, s.rounded, s.text, s.header, s.textCenter]}
            keyboardType="number-pad"
            secureTextEntry={true}
            maxLength={4}
            value={value}
            autoFocus={true}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            // don't attempt to blur
            submitBehavior="submit"
            // that wasn't good enough, keep focus
            onBlur={(e) => e.target.focus()}
          />
          <Button title="submit" onPress={onSubmit} />
        </View>
      </View>
    );
  }
}
