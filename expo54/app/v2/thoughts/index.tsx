import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, Model, Thought } from "@/src/model";
import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return <LoadModel ready={Ready} />;
}

function Ready(props: ModelLoadedProps) {
  const { model, dispatch, style: s, translate: t } = props;
  const list = Model.thoughtsByDate(model);
  return (
    <View style={[s.view]}>
      <Text style={[s.header]}>{t("cbt_list.header")}</Text>
      <View style={[s.flexCol]}>
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
              <Text style={[s.subheader]}>{date}</Text>
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
    </View>
  );
}
function ThoughtItem(props: ModelLoadedProps & { thought: Thought.Thought }) {
  const { model, thought, dispatch, style: s, translate: t } = props;
  return (
    <View style={[s.flexRow]}>
      <Link href={Routes.thoughtViewV2(thought.uuid)}>
        <TouchableOpacity>
          <Text style={[s.text]}>{Thought.label(thought, model)}</Text>
          <Text style={[s.text]}>{Thought.emojis(thought)}</Text>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity
        onPress={() => dispatch(Action.deleteThought(thought.uuid))}
      >
        <Text style={[s.text]}>delete</Text>
      </TouchableOpacity>
    </View>
  );
}
