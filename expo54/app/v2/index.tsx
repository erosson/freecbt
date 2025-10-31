import { useModel } from "@/src/hooks/use-model";
import { useStyle } from "@/src/hooks/use-style";
import { Model } from "@/src/model";
import { Text, View } from "react-native";

export default function Index() {
  const [model] = useModel();
  const s = useStyle(Model.colorScheme(model));
  // const t = useTranslate();
  return (
    <View style={[s.view, s.itemsCenter]}>
      <Text style={[s.text]}>hi!</Text>
    </View>
  );
}
