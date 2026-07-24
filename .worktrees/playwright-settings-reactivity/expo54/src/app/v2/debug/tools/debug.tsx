import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, DistortionData, Thought } from "@/src/model";
import { KVTable } from "@/src/view/kv-table";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as ExpoUpdates from "expo-updates";
import React from "react";
import { Alert, Button, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dump() {
  return <LoadModel ready={Ready} />;
}
function Ready(props: ModelLoadedProps) {
  const { dispatch, style: s } = props;
  const data: readonly [string, string | React.JSX.Element][] = [
    ["Update.channel", ExpoUpdates.channel ?? "-"],
    [
      "Update.createdAt",
      ExpoUpdates.createdAt ? ExpoUpdates.createdAt.toISOString() : "-",
    ],
    ["Update.runtimeVersion", ExpoUpdates.runtimeVersion ?? "-"],
    ["Update.updateId", ExpoUpdates.updateId ?? "-"],
    ["App ver", Constants.expoConfig?.version ?? "(???)"],
    ["buildNumber", Constants.expoConfig?.ios?.buildNumber ?? "(???)"],
    ["OS", Platform.OS],
    [
      "Test: uncaught exception",
      <Button
        key="exception"
        title="Oops"
        onPress={() => {
          throw new Error("oops");
        }}
      />,
    ],
    [
      "Test: console.error",
      <Button
        key="console.error"
        title="Oops"
        onPress={() => {
          console.error("oops");
        }}
      />,
    ],
    [
      "Test: console.warn",
      <Button
        key="console.warn"
        title="Oops"
        onPress={() => {
          console.warn("oops");
        }}
      />,
    ],
    [
      "Test: create a simple thought",
      <Button
        key="create-simple"
        title="Simple"
        onPress={() =>
          dispatch(Action.createThought(exampleThought(), new Date()))
        }
      />,
    ],
    [
      "Test: create a symbols thought",
      <Button
        key="create-symbols"
        title="Symbols"
        onPress={() =>
          dispatch(Action.createThought(symbolsThought(), new Date()))
        }
      />,
    ],
    [
      "Test: create a legacy-encoded thought",
      <Button
        key="create-legacy"
        title="Legacy"
        onPress={async () => {
          const t = Thought.create(exampleThought(), new Date());
          const { fromJson } = Thought.createParsers(DistortionData);
          const enc = fromJson.encode(t);
          (enc as any)["cognitiveDistortions"] = [
            { slug: "all-or-nothing", stuff: "nonsense" },
          ];
          AsyncStorage.setItem(Thought.key(t), JSON.stringify(enc));
          console.log("legacy", Thought.key(t), enc);
        }}
      />,
    ],
    [
      "Test: create an unparsable thought",
      <Button
        key="create-unparsable"
        title="unparsable"
        onPress={() => {
          const t = Thought.create(exampleThought(), new Date());
          const { fromJson } = Thought.createParsers(DistortionData);
          const enc = fromJson.encode(t);
          (enc as any)["automaticThought"] = false;
          AsyncStorage.setItem(Thought.key(t), JSON.stringify(enc));
          console.log("unparsable", Thought.key(t), enc);
        }}
      />,
    ],
    [
      "Delete all user data",
      <Button
        key="clear-all-data"
        title="Delete"
        onPress={() => {
          // https://stackoverflow.com/questions/65481226/react-native-alert-alert-only-works-on-ios-and-android-not-web
          const title = "Delete all user data?";
          const desc =
            "There is no undo. Are you sure you want to delete all AsyncStorage data?";
          if (Platform.OS === "web") {
            if (window.confirm(`${title}\n\n${desc}`)) {
              AsyncStorage.clear();
            }
          } else {
            Alert.alert(title, desc, [
              { text: "Yes", onPress: () => AsyncStorage.clear() },
              { text: "No" },
            ]);
          }
        }}
      />,
    ],
  ];

  return (
    <SafeAreaView style={[s.view, s.p0]}>
      <ScrollView>
        <KVTable entries={data} style={s} />
      </ScrollView>
    </SafeAreaView>
  );
}

function exampleThought(): Thought.Spec {
  return {
    automaticThought: "A simple automatic thought",
    alternativeThought: "A simple alternative thought",
    challenge: "A simple challenge",
    cognitiveDistortions: new Set([
      DistortionData.bySlug.get("all-or-nothing")!,
    ]),
  };
}

function symbolsThought(): Thought.Spec {
  return {
    automaticThought: `A thought
  with
  newlines
  
  # and markdown symbols
  
  \`and more markdown symbols\`
  `,
    alternativeThought: `A thought
  with
  newlines
  
  , and commas, "and quotes", 'and more quotes',
  and other special CSV symbols`,
    challenge: `{"a": "thought", "with": ["JSON", "symbols"]} ]}]}"`,
    cognitiveDistortions: new Set([
      DistortionData.bySlug.get("all-or-nothing")!,
    ]),
  };
}
