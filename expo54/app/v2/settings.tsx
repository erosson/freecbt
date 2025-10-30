import { useStyle } from "@/src/hooks/use-style";
import { Text, View } from "react-native";

export default function Index() {
  const S = useStyle();
  return (
    <View style={[S.view, S.itemsCenter]}>
      <Text style={[S.text]}>hi!</Text>
    </View>
  );
}
