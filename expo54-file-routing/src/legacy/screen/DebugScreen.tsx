import React from "react"
import {
  ScrollView,
  View,
  Text,
  Switch,
  Platform,
  Button,
  Alert,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import * as Feature from "../feature"
import { useAsyncState, withDefault } from "../async-state"
import { Screen, ScreenProps } from "../screens"
import { KeyValuePair } from "@react-native-async-storage/async-storage/lib/typescript/types"
import * as Thought from "../io-ts/thought"
import * as ThoughtStore from "../io-ts/thought/store"
import * as ExpoUpdates from "expo-updates"
// import version from "@freecbt/schema/dist/version.json"

// type KeyValuePair = [string, string]
type Props = ScreenProps<Screen.DEBUG>

function exampleThought(): Thought.Thought {
  return Thought.create({
    automaticThought: "A simple automatic thought",
    alternativeThought: "A simple alternative thought",
    challenge: "A simple challenge",
    cognitiveDistortions: ["all-or-nothing"],
  })
}
function symbolsThought(): Thought.Thought {
  return Thought.create({
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
    cognitiveDistortions: ["all-or-nothing"],
  })
}
const writeThoughts: { [name: string]: () => Promise<void> } = {
  example: async () => {
    await ThoughtStore.write(exampleThought())
    console.log("write example")
  },
  symbols: async () => {
    await ThoughtStore.write(symbolsThought())
    console.log("write symbols")
  },
  legacy: async () => {
    const t = exampleThought()
    const enc = Thought.FromLegacy.encode(t)
    const raw = JSON.stringify(enc)
    await AsyncStorage.setItem(t.uuid, raw)
    console.log("write legacy")
  },
  invalid: async () => {
    const t = exampleThought()
    const enc = Thought.FromLegacy.encode(t)
    ;(enc as any)["automaticThought"] = false
    const raw = JSON.stringify(enc)
    await AsyncStorage.setItem(t.uuid, raw)
    console.log("write invalid")
  },
}

const constItems: [string, string | React.JSX.Element][] = [
  ["Update.channel", ExpoUpdates.channel ?? "-"],
  [
    "Update.createdAt",
    ExpoUpdates.createdAt ? ExpoUpdates.createdAt.toISOString() : "-",
  ],
  ["Update.runtimeVersion", ExpoUpdates.runtimeVersion ?? "-"],
  ["Update.updateId", ExpoUpdates.updateId ?? "-"],
  ["App ver", Constants.expoConfig?.version ?? "(???)"],
  ["buildNumber", Constants.expoConfig?.ios?.buildNumber ?? "(???)"],
  [
    "Test exception reporting",
    <Button
      title="Oops"
      onPress={() => {
        throw new Error("oops")
      }}
    />,
  ],
  [
    "Test console.error reporting",
    <Button
      title="Oops"
      onPress={() => {
        console.error("oops")
      }}
    />,
  ],
  [
    "Test console.warn reporting",
    <Button
      title="Oops"
      onPress={() => {
        console.warn("oops")
      }}
    />,
  ],
  ["OS", Platform.OS],
  [
    "Test: create a simple thought",
    <Button title="Simple" onPress={() => writeThoughts.example()} />,
  ],
  [
    "Test: create a symbols thought",
    <Button title="Symbols" onPress={() => writeThoughts.symbols()} />,
  ],
  [
    "Test: create a legacy thought",
    <Button title="Legacy" onPress={() => writeThoughts.legacy()} />,
  ],
  [
    "Test: create an invalid thought",
    <Button title="Invalid" onPress={() => writeThoughts.invalid()} />,
  ],
  [
    "Delete all user data",
    <Button
      title="Delete"
      onPress={() =>
        Alert.alert(
          "Delete all user data?",
          "There is no undo. Are you sure you want to delete all AsyncStorage data?",
          [{ text: "Yes", onPress: () => AsyncStorage.clear() }, { text: "No" }]
        )
      }
    />,
  ],
]
export default function DebugScreen(props: Props): React.JSX.Element {
  // const storage = useAsyncState<KeyValuePair[]>(async () => {
  const storage = useAsyncState<readonly KeyValuePair[]>(async () => {
    const keys = await AsyncStorage.getAllKeys()
    return await AsyncStorage.multiGet(keys)
  })
  const [dump, setDump] = React.useState<boolean>(false)
  const { feature, updateFeature } = React.useContext(Feature.Context)

  const items: [string, string | React.JSX.Element][] = [
    ...constItems,
    ...Object.entries(feature)
      // @ts-ignore: sort features by name. I promise key in [key, value] is a string
      .sort((a, b) => a[0] > b[0])
      .map(([key, val]: [string, boolean]): [string, React.JSX.Element] => [
        key,
        <Switch
          value={val}
          onValueChange={() => updateFeature({ [key]: !val })}
        />,
      ]),
    [
      "Dump AsyncStorage?",
      <Switch value={dump} onValueChange={() => setDump(!dump)} />,
    ],
  ]
  return (
    <ScrollView>
      <Text style={{ fontSize: 24, borderBottomWidth: 1 }}>Debug</Text>
      <View>{items.map(renderEntry)}</View>
      <View>
        {(dump ? withDefault(storage, []) : []).map(
          ([key, val]: KeyValuePair) => (
            <View
              key={key}
              style={{ borderBottomWidth: 1, borderColor: "black" }}
            >
              <Text>{`AsyncStorage["${key}"]: \n${val ?? ""}`}</Text>
            </View>
          )
        )}
      </View>
    </ScrollView>
  )
}

function renderEntry(
  [key, val]: [string, string | React.JSX.Element],
  i: number
): React.JSX.Element {
  if (typeof val === "string") {
    return (
      <View
        key={key}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomWidth: 1,
        }}
      >
        <Text>{key}: </Text>
        <Text style={{ alignSelf: "flex-end" }}>{val}</Text>
      </View>
    )
  } else if (React.isValidElement(val)) {
    return (
      <View
        key={key}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomWidth: 1,
        }}
      >
        <Text>{key}: </Text>
        <View>{val}</View>
      </View>
    )
  } else {
    return (
      <View
        key={key}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomWidth: 1,
        }}
      >
        <Text>{key}</Text>
      </View>
    )
  }
}
