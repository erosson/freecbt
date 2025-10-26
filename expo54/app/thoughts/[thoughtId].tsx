import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const { thoughtId } = useLocalSearchParams();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>id: {thoughtId}</Text>
    </View>
  );
}
