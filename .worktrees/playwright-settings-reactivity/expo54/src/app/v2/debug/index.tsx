import { useDefaultStyle } from "@/src/hooks/use-style";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const s = useDefaultStyle();
  return (
    <View style={[s.view]}>
      <Link href="/v2">
        <Text style={[s.header, s.href]}>Return to FreeCBT</Text>
      </Link>
      <Text style={[s.text, s.my4]}>
        list of debug pages is in the nav drawer.
      </Text>
      <Link href="/debug">
        <Text style={[s.href]}>legacy debug page</Text>
      </Link>
    </View>
  );
}
