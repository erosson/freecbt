import { TranslateFn } from "@/src/hooks/use-i18n";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Archive, Model, Thought } from "@/src/model";
import { DownloadOrShareLink } from "@/src/view/download-or-share";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Backup() {
  return <LoadModel ready={Ready} />;
}
export function Ready(props: ModelLoadedProps) {
  const { style: s, translate: t } = props;
  return (
    <SafeAreaView style={[s.view]}>
      <View style={[s.container]}>
        <Text style={[s.header]}>{t("export_screen.header")}</Text>
        <Text style={[s.text]}>{t("export_screen.description")}</Text>
        <MarkdownLink {...props} />
        <CSVLink {...props} />
        <JSONLink {...props} />
      </View>
    </SafeAreaView>
  );
}

function MarkdownLink(props: ModelLoadedProps) {
  const { model, style: s, translate: t } = props;
  const thoughts = Model.thoughtsList(model);
  return (
    <DownloadOrShareLink
      name="FreeCBT.md"
      body={() => toMarkdown({ thoughts, translate: t })}
      type="text/markdown"
      UTI="public.text"
      translate={t}
      error={(e) => <Text style={[s.errorText]}>{e}</Text>}
      share={(onPress) => (
        <TouchableOpacity style={[s.button]} onPress={onPress}>
          <Text style={[s.buttonText]}>
            {t("export_screen.markdown.button")}
          </Text>
        </TouchableOpacity>
      )}
      download={() => (
        <TouchableOpacity style={[s.button]}>
          <Text style={[s.buttonText]}>
            {t("export_screen.markdown.button")}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

function CSVLink(props: ModelLoadedProps) {
  const { model, style: s, translate: t } = props;
  const thoughts = Model.thoughtsList(model);
  return (
    <DownloadOrShareLink
      name="FreeCBT.csv"
      body={() => toCSV(thoughts)}
      type="text/csv"
      UTI="public.comma-separated-values-text"
      translate={t}
      error={(e) => <Text style={[s.errorText]}>{e}</Text>}
      share={(onPress) => (
        <TouchableOpacity style={[s.button]} onPress={onPress}>
          <Text style={[s.buttonText]}>{t("export_screen.csv.button")}</Text>
        </TouchableOpacity>
      )}
      download={() => (
        <TouchableOpacity style={[s.button]}>
          <Text style={[s.buttonText]}>{t("export_screen.csv.button")}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

function JSONLink(props: ModelLoadedProps) {
  const { model, style: s, translate: t } = props;
  const parser = Archive.createParsers(model.distortionData);
  const toArchive = () => parser.fromJson.encode(Model.toArchive(model));
  return (
    <DownloadOrShareLink
      name="FreeCBT.json"
      body={() => JSON.stringify(toArchive())}
      type="application/json"
      UTI="public.json"
      translate={t}
      error={(e) => <Text style={[s.errorText]}>{e}</Text>}
      share={(onPress) => (
        <TouchableOpacity style={[s.button]} onPress={onPress}>
          <Text style={[s.buttonText]}>{t("export_screen.json.button")}</Text>
        </TouchableOpacity>
      )}
      download={() => (
        <TouchableOpacity style={[s.button]}>
          <Text style={[s.buttonText]}>{t("export_screen.json.button")}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const EMPTY = "🤷";
function toMarkdown(props: {
  thoughts: readonly Thought.Thought[];
  translate: TranslateFn;
}): string {
  const { thoughts, translate: t } = props;
  return thoughts
    .map((thought) => {
      const distortions = Thought.distortionsList(thought);
      return `\
created: ${thought.createdAt.toLocaleDateString()} ${thought.createdAt.toLocaleTimeString()}
updated: ${thought.updatedAt.toLocaleDateString()} ${thought.createdAt.toLocaleTimeString()}
id: ${thought.uuid}

## ${t("auto_thought")}

${thought.automaticThought ? escapeMarkdown(thought.automaticThought) : EMPTY}

## ${t("cog_distortion")}

${
  distortions.length > 0
    ? distortions.map((d) => `- ${t(d.labelKey)}`).join("\n")
    : EMPTY
}

## ${t("challenge")}

${thought.challenge ? escapeMarkdown(thought.challenge) : EMPTY}

## ${t("alt_thought")}

${
  thought.alternativeThought
    ? escapeMarkdown(thought.alternativeThought)
    : EMPTY
}
`;
    })
    .join("\n---\n");
}
function escapeMarkdown(s: string): string {
  return s.replace(/([#_=`])/g, "\\$1").replace(/:FreeCBT:/g, "\\:FreeCBT\\:");
}

function toCSV(ts: readonly Thought.Thought[]): string {
  const headers = [
    "uuid",
    "createdAt",
    "updatedAt",
    "automaticThought",
    "cognitiveDistortions",
    "challenge",
    "alternativeThought",
  ];
  const table: string[][] = [headers].concat(
    ts.map((t): string[] => {
      return [
        t.uuid,
        t.createdAt.toISOString(),
        t.updatedAt.toISOString(),
        t.automaticThought,
        Array.from(t.cognitiveDistortions)
          .map((d) => d.slug)
          .sort()
          .join(","),
        t.challenge,
        t.alternativeThought,
      ];
    })
  );
  return table.map((row) => row.map(escapeCSV).join(",")).join("\n");
}
function escapeCSV(s: string): string {
  s = s.replace(/"/g, '""');
  if (/[,"'\n\\]/.test(s)) {
    s = `"${s}"`;
  }
  return s;
}
