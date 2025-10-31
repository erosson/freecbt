import { useElmArch } from "@/src/hooks/use-elm-arch";
import { useDefaultStyle } from "@/src/hooks/use-style";
import { Button, Text, View } from "react-native";
import * as Layout from "./_layout";

export default function Index() {
  const S = useDefaultStyle();
  const [model, dispatch] = useElmArch(Layout.Ctx);
  return (
    <View style={[S.view, S.itemsCenter]}>
      <Text style={[S.text, S.mx2]}>A: {model.value}</Text>
      <View style={[S.flexRow, S.m2]}>
        <View style={[S.mx2]}>
          <Button title="++" onPress={() => dispatch(Layout.incr())} />
        </View>
        <View style={[S.mx2]}>
          <Button title="--" onPress={() => dispatch(Layout.decr())} />
        </View>
      </View>
    </View>
  );
}
