import { useStyle } from "@/src/hooks/use-style";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const S = useStyle();
  return (
    <View style={[S.view]}>
      <Link href="/v2/debug/counter">
        <Text style={[S.href]}>counter</Text>
      </Link>
      <Link href="/v2/debug/counter">
        <Text style={[S.href]}>counter</Text>
      </Link>
    </View>
  );
}
