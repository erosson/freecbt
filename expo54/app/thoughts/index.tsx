import { usePromiseState } from "@/src/hooks/use-promise-state";
import { PromiseState } from "@/src/model";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View } from "react-native";

export default function Index() {
  const keys = usePromiseState(
    // quick hack to deal with web mode's ssr
    typeof window === "undefined"
      ? Promise.resolve([])
      : AsyncStorage.getAllKeys()
  );
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>
        {PromiseState.match(keys, {
          pending: () => <Text>Loading...</Text>,
          failure: (e) => <Text>error: {e.message}</Text>,
          success: (v) => (
            <Text>
              {v.length} asyncstorage keys: {v}
            </Text>
          ),
        })}
      </Text>
    </View>
  );
}
