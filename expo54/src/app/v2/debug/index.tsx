import { useDefaultStyle } from "@/src/hooks/use-style";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const S = useDefaultStyle();
  return (
    <View style={[S.view]}>
      <Link href="/v2/debug/pure-elm-arch">
        <Text style={[S.href]}>pure-elm-arch</Text>
      </Link>
      <Link href="/v2/debug/counter">
        <Text style={[S.href]}>counter</Text>
      </Link>
      <Link href="/debug">
        <Text style={[S.href]}>legacy debug</Text>
      </Link>
    </View>
  );
}
