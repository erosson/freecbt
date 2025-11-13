import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, Model, Thought } from "@/src/model";
import { LinkButton } from "@/src/view/view";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return <LoadModel ready={Ready} />;
}
function Ready(props: ModelLoadedProps) {
  const { model, dispatch, style: s, translate: t } = props;
  const list = Model.thoughtsByDate(model);
  const today = new Date().toDateString();
  return (
    <SafeAreaView style={[s.view]}>
      <View style={[s.flexRow, s.justifyBetween, s.container]}>
        <Text style={[s.header]}>{t("cbt_list.header")}</Text>
        <View>
          <View style={[s.flexCol]}>
            <LinkButton
              style={s}
              href={Routes.settingsV2()}
              label={t("accessibility.settings_button")}
              icon="settings"
            />
            <LinkButton
              style={s}
              href={Routes.thoughtCreateV2()}
              label={t("accessibility.new_thought_button")}
              icon="message-circle"
            />
          </View>
        </View>
      </View>
      <View style={[s.flexCol, s.container]}>
        <Text style={[s.text]}>
          num thoughts: {model.thoughts.size}. date-groups: {list.length}. parse
          errors: {model.thoughtParseErrors.size}.
        </Text>
        {list.length === 0 ? (
          <Text style={[s.text]}>{t("cbt_list.empty")}</Text>
        ) : (
          list.map(([date, thoughts]) => (
            // '<React.Fragment>' is longhand for '<></>'. it's needed for attributes like 'key'
            <React.Fragment key={date}>
              <Text style={[s.subheader]}>
                {today === date ? t("cbt_list.today") : date}
              </Text>
              {thoughts.map((thought) => (
                <ThoughtItem
                  key={thought.uuid}
                  style={s}
                  translate={t}
                  thought={thought}
                  model={model}
                  dispatch={dispatch}
                />
              ))}
            </React.Fragment>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}
function ThoughtItem(props: ModelLoadedProps & { thought: Thought.Thought }) {
  const { model, thought, dispatch, style: s, translate: t } = props;
  const onDelete = () => dispatch(Action.deleteThought(thought.uuid));
  return (
    <View style={[s.flexRow, s.justifyBetween, s.m2]}>
      <TouchableOpacity style={[s.flex1, s.border, s.rounded, s.p2]}>
        <Link style={[s.flex1]} href={Routes.thoughtViewV2(thought.uuid)}>
          <Text style={[s.text]}>
            {Thought.label(thought, model)}
            {"\n"}
            {Thought.emojis(thought)}
          </Text>
          <Text style={[s.text]}></Text>
        </Link>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.selfStart, s.border, s.rounded, s.p2]}
        onPress={onDelete}
      >
        <Text style={[s.text]}>
          <Feather
            name="trash"
            accessibilityLabel={t("accessibility.delete_thought_button")}
          />
        </Text>
      </TouchableOpacity>
    </View>
  );
}
