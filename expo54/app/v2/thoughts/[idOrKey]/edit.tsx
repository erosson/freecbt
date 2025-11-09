import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, Thought } from "@/src/model";
import { LinkButton } from "@/src/view/view";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { useThoughtFromParams } from ".";
import { CBTForm, SlideName } from "../create";

export default function Create() {
  return <LoadModel ready={Ready} />;
}

function Ready({ model, dispatch, style: s, translate: t }: ModelLoadedProps) {
  const res = useThoughtFromParams(model);
  const params = useLocalSearchParams<{ slide?: string }>();
  const slide = SlideName.safeParse(params.slide);
  const [value, setValue] = useState<Thought.Spec>(
    res.status === "success" ? res.value : Thought.emptySpec()
  );
  if (res.status === "error") return res.error;
  return (
    <View style={[s.view]}>
      <View style={[s.flexRow, s.justifyBetween, s.container]}>
        <Text style={[s.header]}>{t("cbt_form.header")}</Text>
        <View>
          <View>
            <LinkButton
              style={s}
              href={Routes.helpV2()}
              label={t("accessibility.help_button")}
              icon="help-circle"
            />
            <LinkButton
              style={s}
              href={Routes.thoughtListV2()}
              label={t("accessibility.list_button")}
              icon="list"
            />
          </View>
        </View>
      </View>
      <CBTForm
        model={model}
        style={s}
        translate={t}
        value={value!}
        slide={slide.data ?? undefined}
        onChange={setValue}
        onSubmit={() =>
          dispatch(
            Action.updateThought({
              ...res.value,
              // strip extra fields, just in case they somehow end up here
              ...Thought.Spec.decode(value),
            })
          )
        }
      />
    </View>
  );
}
