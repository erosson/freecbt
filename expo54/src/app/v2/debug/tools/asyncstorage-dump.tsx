import { PromiseRender } from "@/src/hooks/use-promise-state";
import { Style, useDefaultStyle } from "@/src/hooks/use-style";
import { KVTable, KVTableEntry } from "@/src/view/kv-table";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyValuePair } from "@react-native-async-storage/async-storage/lib/typescript/types";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dump() {
  const s = useDefaultStyle();
  const [entries, setEntries] = useState<Promise<readonly KeyValuePair[]>>(
    new Promise(() => {})
  );
  useEffect(() => {
    setEntries(fetchEntries());
  }, []);

  return (
    <SafeAreaView style={[s.view, s.p0]}>
      <ScrollView>
        <PromiseRender
          promise={entries}
          pending={() => <ActivityIndicator />}
          failure={(err) => <Text style={[s.errorText]}>{err.message}</Text>}
          success={(entries) => {
            return (
              <KVTable
                entries={entries.map((pair) => renderEntry(pair, s))}
                style={s}
              />
            );
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function renderEntry([k, v]: [string, string | null], s: Style): KVTableEntry {
  try {
    if (v) {
      const j = JSON.stringify(JSON.parse(v), null, 2);
      return [
        k,
        <Text key={k} style={[s.text, { fontFamily: "monospace" }]}>
          {j}
        </Text>,
      ];
    }
  } catch {}
  return [k, v ?? ""];
}
async function fetchEntries() {
  const keys = await AsyncStorage.getAllKeys();
  return await AsyncStorage.multiGet(keys.toSorted());
}
