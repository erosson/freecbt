import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Model, Thought } from "@/src/model";
import { Redirect, Unmatched, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Show() {
  return <LoadModel ready={Ready} />;
}
function Ready({ model, dispatch, style: s, translate: t }: ModelLoadedProps) {
  const res = useThoughtFromParams(model);
  if (res.status === "error") return res.error;
  const thought = res.value;
  return (
    <View style={[s.view]}>
      <View style={[s.flexRow, s.justifyBetween, s.container]}>
        <Text style={[s.header]}>{t("cbt_form.header")}</Text>
      </View>
      <View style={[s.container]}>
        <Text style={[s.text]}>{thought.uuid}</Text>
      </View>
    </View>
  );
}

type Result<V, E> =
  | { status: "success"; value: V }
  | { status: "error"; error: E };

export function useThoughtFromParams(
  model: Model.Ready
): Result<Thought.Thought, React.JSX.Element> {
  const { idOrKey } = useLocalSearchParams<{ idOrKey: string }>();
  const id = Thought.Thought.shape.uuid.decode(idOrKey);
  const key = Thought.keyFromId.decode(id);
  if (idOrKey === key) {
    return {
      status: "error",
      error: <Redirect href={Routes.thoughtViewV2(id)} />,
    };
  }
  const thought = model.thoughts.get(key) ?? null;
  if (!thought) {
    return { status: "error", error: <Unmatched /> };
  }
  return { status: "success", value: thought };
}
