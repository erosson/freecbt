import { useStyle } from "@/src/hooks/use-style";
import { useContext, useReducer } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import * as Layout from "./_layout";

export default function Index() {
  const S = useStyle();
  const [modelA, dispatchA] = useContext(Layout.Ctx);
  const [modelB, dispatchB] = useReducer(Layout.update, Layout.init());
  return (
    <View style={[S.view, S.itemsCenter]}>
      <Text style={[S.text, S.mx2]}>A: {modelA.value}</Text>
      <View style={[S.flexRow, S.m2]}>
        <View style={[S.mx2]}>
          <Button title="++" onPress={() => dispatchA(Layout.incr())} />
        </View>
        <View style={[S.mx2]}>
          <Button title="--" onPress={() => dispatchA(Layout.decr())} />
        </View>
      </View>
      <Text style={[S.text, S.mx2]}>B: {modelB.value}</Text>
      <View style={[S.flexRow, S.m2]}>
        <TouchableOpacity
          style={[S.button, S.mx2]}
          onPress={() => dispatchB(Layout.incr())}
        >
          <Text style={[S.buttonText]}>++</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.button, S.mx2]}
          onPress={() => dispatchB(Layout.decr())}
        >
          <Text style={[S.buttonText]}>--</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
