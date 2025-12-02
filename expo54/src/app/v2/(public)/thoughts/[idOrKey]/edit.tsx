import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, Thought } from "@/src/model";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView style={[s.view]}>
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
    </SafeAreaView>
  );
}
