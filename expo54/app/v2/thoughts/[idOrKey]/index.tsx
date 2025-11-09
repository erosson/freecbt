import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Distortion, Model, Thought } from "@/src/model";
import { ImagePath } from "@/src/view/path";
import { LinkButton } from "@/src/view/view";
import { Redirect, Unmatched, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

export default function Show() {
  return <LoadModel ready={Ready} />;
}
function Ready({ model, style: s, translate: t }: ModelLoadedProps) {
  const res = useThoughtFromParams(model);
  if (res.status === "error") return res.error;
  const thought = res.value;
  // filter model.distortionData.list below, instead of iterating
  // thought.cognitiveDistortions directly, because it guarantees a
  // consistent order.
  const slugs = new Set(
    Array.from(thought.cognitiveDistortions).map((d) => d.slug)
  );
  const distortions = model.distortionData.list.filter((d) =>
    slugs.has(d.slug)
  );
  return (
    <View style={[s.view]}>
      <View style={[s.flexRow, s.justifyBetween, s.container]}>
        <Text style={[s.header]}>{t("cbt_form.header")}</Text>
        <View>
          <View>
            <LinkButton
              style={s}
              href={Routes.thoughtListV2()}
              label={t("accessibility.list_button")}
              icon="list"
            />
          </View>
        </View>
      </View>
      <View style={[s.container]}>
        <Text style={[s.subheader, s.mt4]}>{t("auto_thought")}</Text>
        <View style={[s.flexRow, s.border, s.rounded]}>
          {thought.automaticThought ? (
            <>
              <Image
                source={ImagePath.yellowBubble}
                style={[{ width: 24, height: 24 }, s.selfCenter, s.m2]}
              />
              <View style={[s.border, s.rounded, s.p2]}>
                <Text style={[s.text]}>{thought.automaticThought}</Text>
              </View>
            </>
          ) : (
            <Text style={[s.text, s.m2]}>🤷‍</Text>
          )}
        </View>
        <Text style={[s.subheader, s.mt4]}>{t("cog_distortion")}</Text>
        <View style={[s.flexCol, s.border, s.rounded, s.p1]}>
          {distortions.length ? (
            distortions.map((d) => (
              <Text key={d.slug} style={[s.text, s.p1]}>
                {Distortion.emoji(d)} {t(d.labelKey)}
              </Text>
            ))
          ) : (
            <Text style={[s.text, s.m2]}>🤷‍</Text>
          )}
        </View>
        <Text style={[s.subheader, s.mt4]}>{t("challenge")}</Text>
        <View style={[s.flexRow, s.border, s.rounded]}>
          {thought.challenge ? (
            <Text style={[s.text, s.m2]}>{thought.challenge}</Text>
          ) : (
            <Text style={[s.text, s.m2]}>🤷‍</Text>
          )}
        </View>
        <Text style={[s.subheader, s.mt4]}>{t("alt_thought")}</Text>
        <View style={[s.flexRow, s.border, s.rounded]}>
          {thought.alternativeThought ? (
            <>
              <Image
                source={ImagePath.pinkBubble}
                style={[{ width: 24, height: 24 }, s.selfCenter, s.m2]}
              />
              <View style={[s.border, s.rounded, s.p2]}>
                <Text style={[s.text]}>{thought.alternativeThought}</Text>
              </View>
            </>
          ) : (
            <Text style={[s.text, s.m2]}>🤷‍</Text>
          )}
        </View>
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
