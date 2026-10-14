import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, Model, Thought } from "@/src/model";
import { ThoughtCard } from "@/src/view/thought-card";
import { Feather } from "@expo/vector-icons";
import {
  Link,
  Redirect,
  Unmatched,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Show() {
  return <LoadModel ready={Ready} />;
}

function Ready({ model, dispatch, style: s, translate: t }: ModelLoadedProps) {
  const router = useRouter();
  const res = useThoughtFromParams(model);
  if (res.status === "error") return res.error;
  const thought = res.value;

  const isDark =
    model.settings.theme === "dark" ||
    (model.settings.theme === null && model.deviceColorScheme === "dark");
  const locale = Model.locale(model);
  const textColor = s.text.color;
  const isRtl = locale === "ar" || locale === "fa";
  const backLabel =
    locale === "ar"
      ? "العودة للأفكار"
      : t("cbt_list.deck_view") || "Back to Deck";

  return (
    <SafeAreaView style={[s.view]}>
      <View style={[s.container, styles.container]}>
        <View style={styles.topNav}>
          <Link href={Routes.thoughtListV2()} asChild>
            <TouchableOpacity style={styles.backBtn}>
              <Feather
                name={isRtl ? "arrow-right" : "arrow-left"}
                size={18}
                color={textColor}
              />
              <Text style={[styles.backText, { color: textColor }]}>
                {backLabel}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.cardWrapper}>
          <ThoughtCard
            thought={thought}
            model={model}
            style={s}
            translate={t}
            isDark={isDark}
            locale={locale}
            onDelete={() => {
              dispatch(Action.deleteThought(thought.uuid));
              router.replace(Routes.thoughtListV2());
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  topNav: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardWrapper: {
    flex: 1,
  },
});

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
