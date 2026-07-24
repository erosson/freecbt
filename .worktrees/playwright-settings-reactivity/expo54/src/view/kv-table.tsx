import { Text, View } from "react-native";
import { Style } from "../hooks/use-style";

export type KVTableEntry = readonly [string, string | React.JSX.Element];
export function KVTable(props: {
  entries: readonly KVTableEntry[];
  style: Style;
}) {
  const { entries, style: s } = props;
  const cell = [s.border, s.p1];
  return (
    <View style={[s.flexCol]}>
      {entries.map(([k, v]) => (
        <View key={k} style={[s.flexRow]}>
          <Text style={[...cell, s.text, { flex: 1 }, s.textRight]}>{k}</Text>
          {typeof v === "string" ? (
            <Text style={[...cell, s.text, { flex: 3 }]}>{v}</Text>
          ) : (
            <View style={[cell, { flex: 3 }]}>{v}</View>
          )}
        </View>
      ))}
    </View>
  );
}
