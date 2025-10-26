import React from "react"
import { ScrollView, StatusBar, Text } from "react-native"
import theme from "../theme"
import Constants from "expo-constants"
import * as AsyncState from "../async-state"
import {
  Header,
  Row,
  Container,
  IconButton,
  ActionButton,
  Paragraph,
} from "../ui"
import { Screen, ScreenProps } from "../screens"
import i18n from "../i18n"
import { FadesIn } from "../animations"
import * as TS from "../io-ts/thought/store"
import * as FS from "expo-file-system"
import * as Sharing from "expo-sharing"
import * as Thought from "../io-ts/thought"
import { Archive } from "../io-ts/archive"

type Props = ScreenProps<Screen.EXPORT>

export default function ExportScreen(props: Props): React.JSX.Element {
  const thoughts = AsyncState.useAsyncState(TS.getValidExercises)
  const archive = AsyncState.useAsyncState(TS.readArchive)

  return (
    <FadesIn style={{ backgroundColor: theme.lightOffwhite }} pose="visible">
      <ScrollView
        style={{
          backgroundColor: theme.lightOffwhite,
          marginTop: Constants.statusBarHeight,
          paddingTop: 24,
          height: "100%",
        }}
      >
        <Container style={{ paddingBottom: 128 }}>
          <StatusBar barStyle="dark-content" />
          <Row style={{ marginBottom: 18 }}>
            <Header>{i18n.t("export_screen.header")}</Header>
            <IconButton
              featherIconName={"list"}
              accessibilityLabel={i18n.t("accessibility.list_button")}
              onPress={() => {
                // props.navigation.pop()
                props.navigation.push(Screen.CBT_LIST)
              }}
            />
          </Row>
          <Row style={{ marginBottom: 9 }}>
            <Paragraph>{i18n.t("export_screen.description")}</Paragraph>
          </Row>
          {AsyncState.fold(
            thoughts,
            () => null,
            () => null,
            (error) => (
              <Text>{error}</Text>
            ),
            (ts) => (
              <>
                <Markdown thoughts={ts} />
                <CSV thoughts={ts} />
              </>
            )
          )}
          {AsyncState.fold(
            archive,
            () => null,
            () => null,
            (error) => (
              <Text>{error}</Text>
            ),
            (a) => (
              <>
                <JSON_ archive={a} />
              </>
            )
          )}
        </Container>
      </ScrollView>
    </FadesIn>
  )
}

function Markdown(props: { thoughts: Thought.Thought[] }): React.JSX.Element {
  return (
    <ExportButton
      title={i18n.t("export_screen.markdown.button")}
      body={() => toMarkdown(props.thoughts)}
      ext="md"
      opts={{
        UTI: "public.text",
        mimeType: "text/markdown",
      }}
    />
  )
}

function CSV(props: { thoughts: Thought.Thought[] }): React.JSX.Element {
  return (
    <ExportButton
      title={i18n.t("export_screen.csv.button")}
      body={() => toCSV(props.thoughts)}
      ext="csv"
      opts={{
        UTI: "public.comma-separated-values-text",
        mimeType: "text/csv",
      }}
    />
  )
}

function JSON_(props: { archive: Archive }): React.JSX.Element {
  return (
    <ExportButton
      title={i18n.t("export_screen.json.button")}
      body={() => JSON.stringify(props.archive, null, 2)}
      ext="json"
      opts={{
        UTI: "public.json",
        mimeType: "application/json",
      }}
    />
  )
}

function ExportButton(props: {
  title: string
  body: () => string
  ext: string
  opts: Sharing.SharingOptions
}): React.JSX.Element {
  const isSharable = AsyncState.useAsyncState(Sharing.isAvailableAsync)
  const path: string = `${FS.documentDirectory}FreeCBT.${props.ext}`

  async function onExportShare() {
    const body = props.body()
    await FS.writeAsStringAsync(path, body)
    await Sharing.shareAsync(path, props.opts)
  }

  return (
    <>
      {AsyncState.fold(
        isSharable,
        () => null,
        () => null,
        (err) => (
          <Text>{err}</Text>
        ),
        (sharable) =>
          sharable ? (
            <>
              <Row style={{ marginBottom: 9 }}>
                <ActionButton
                  flex={1}
                  title={props.title}
                  fillColor="#EDF0FC"
                  textColor={theme.darkBlue}
                  onPress={onExportShare}
                />
              </Row>
            </>
          ) : null
      )}
    </>
  )
}

function toMarkdown(ts: Thought.Thought[]): string {
  return ts
    .map((t) => {
      return `\
created: ${t.createdAt.toISOString()},
updated: ${t.updatedAt.toISOString()},
id: ${t.uuid}

# Automatic Thought

${t.automaticThought ? escapeMarkdown(t.automaticThought) : "🤷‍"}

# Cognitive Distortions

${
  t.cognitiveDistortions
    ? Array.from(t.cognitiveDistortions)
        .map((d) => `- ${d.label()}`)
        .sort()
        .join("\n")
    : "🤷‍"
}

# Challenge

${t.challenge ? escapeMarkdown(t.challenge) : "🤷‍"}

# Alternative Thought

${t.alternativeThought ? escapeMarkdown(t.alternativeThought) : "🤷‍"}
`
    })
    .join("\n---\n")
}
function escapeMarkdown(s: string): string {
  return s.replace(/([#_=`])/g, "\\$1").replace(/:FreeCBT:/g, "\\:FreeCBT\\:")
}

function toCSV(ts: Thought.Thought[]): string {
  const headers = [
    "uuid",
    "createdAt",
    "updatedAt",
    "automaticThought",
    "cognitiveDistortions",
    "challenge",
    "alternativeThought",
  ]
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
      ]
    })
  )
  return table.map((row) => row.map(escapeCSV).join(",")).join("\n")
}
function escapeCSV(s: string): string {
  s = s.replace(/"/g, '""')
  if (/[,"'\n\\]/.test(s)) {
    s = `"${s}"`
  }
  return s
}
