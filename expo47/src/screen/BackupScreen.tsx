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
import * as T from "io-ts"
import * as FS from "expo-file-system"
import * as Sharing from "expo-sharing"
import * as Picker from "expo-document-picker"

type Props = ScreenProps<Screen.BACKUP>

export default function BackupScreen(props: Props): React.JSX.Element {
  const archive = AsyncState.useAsyncState<string>(TS.readArchiveString)

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
            <Header>{i18n.t("backup_screen.header")}</Header>
            <IconButton
              featherIconName={"list"}
              accessibilityLabel={i18n.t("accessibility.list_button")}
              onPress={() => {
                // props.navigation.pop()
                props.navigation.push(Screen.CBT_LIST)
              }}
            />
          </Row>
          {AsyncState.fold(
            archive,
            () => null,
            () => null,
            (error) => (
              <Text>{error}</Text>
            ),
            (a) => (
              <>
                <Export archive={a} />
                <Import archive={a} />
              </>
            )
          )}
        </Container>
      </ScrollView>
    </FadesIn>
  )
}

function Export(props: { archive: string }): React.JSX.Element {
  const [isCopied, setIsCopied] = React.useState<string | null>(null)
  const isSharable = AsyncState.useAsyncState(Sharing.isAvailableAsync)
  const writePath: string = FS.documentDirectory + "FreeCBT-backup.txt"
  const sharePath: string = FS.cacheDirectory + "FreeCBT-backup.txt"

  //async function onExportClipboard() {
  //  const success = await Clipboard.setStringAsync(props.archive)
  //  setIsCopied(success ? "clipboard" : null)
  //}
  async function onExportFile() {
    await FS.writeAsStringAsync(writePath, props.archive)
    // await Linking.openURL(writePath)
    setIsCopied("file")
  }
  async function onExportShare() {
    await FS.writeAsStringAsync(sharePath, props.archive)
    await Sharing.shareAsync(sharePath, {
      UTI: "org.erosson.freecbt.backup",
      mimeType: "application/freecbt-backup",
    })
  }

  return (
    <>
      <Row style={{ marginBottom: 9 }}>
        <Paragraph>{i18n.t("backup_screen.export.description")}</Paragraph>
      </Row>
      {/*
      <Row style={{ marginBottom: 9 }}>
        <TextInput
          style={{
            ...textInputStyle,
            backgroundColor: "white",
          }}
          // \@ts-expect-error not sure why this isn't typed, but it makes this fill the width
          flex={1}
          value={props.archive}
          multiline={true}
          numberOfLines={3}
          editable={true}
          selectTextOnFocus={true}
        />
      </Row>
      <Row style={{ marginBottom: 9 }}>
        <ActionButton
          flex={1}
          title={i18n.t("backup_screen.export.clipboard.button")}
          fillColor="#EDF0FC"
          textColor={theme.darkBlue}
          onPress={onExportClipboard}
        />
      </Row>
      {isCopied === "clipboard" ? (
        <Row style={{ marginBottom: 9 }}>
          <Text>{i18n.t("backup_screen.export.clipboard.success")}</Text>
        </Row>
      ) : null}*/}
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
                  title={i18n.t("backup_screen.export.share.button")}
                  fillColor="#EDF0FC"
                  textColor={theme.darkBlue}
                  onPress={onExportShare}
                />
              </Row>
            </>
          ) : null
      )}
      <Row style={{ marginBottom: 9 }}>
        <ActionButton
          flex={1}
          title={i18n.t("backup_screen.export.file.button")}
          fillColor="#EDF0FC"
          textColor={theme.darkBlue}
          onPress={onExportFile}
        />
      </Row>
      {isCopied === "file" ? (
        <>
          <Row style={{ marginBottom: 9 }}>
            <Text>{i18n.t("backup_screen.export.file.success")}</Text>
          </Row>
          <Row style={{ marginBottom: 9 }}>
            <Text>{writePath}</Text>
          </Row>
        </>
      ) : null}
    </>
  )
}

function Import(props: { archive: string }): React.JSX.Element {
  const [archiveWrite, setArchiveWrite] = React.useState<
    AsyncState.RemoteData<null, T.Errors>
  >({
    status: "init",
  })
  const [importText, setImportText] = React.useState<string>("")

  //async function onImportClipboard(): Promise<void> {
  //  const s = importText ? importText : await Clipboard.getStringAsync()
  //  if (s !== importText) setImportText(s)
  //  const promise = TS.writeArchiveString(s)
  //  setArchiveWrite({
  //    status: "pending",
  //    promise: promise.then(() => {}),
  //  })
  //  const result = await promise
  //  setArchiveWrite(
  //    result === null
  //      ? { status: "success", value: null }
  //      : { status: "failure", error: result }
  //  )
  //}
  async function onImportFile(): Promise<void> {
    const res = await Picker.getDocumentAsync({
      // type: "application/freecbt-backup",
      type: "text/*",
    })
    if (!res.canceled && res.assets) {
      const s = await FS.readAsStringAsync(res.assets[0].uri)
      if (s !== importText) setImportText(s)
      const promise = TS.writeArchiveString(s)
      setArchiveWrite({
        status: "pending",
        promise: promise.then(() => {}),
      })
      const result = await promise
      setArchiveWrite(
        result === null
          ? { status: "success", value: null }
          : { status: "failure", error: result }
      )
    } else {
      setArchiveWrite({
        status: "failure",
        error: [{ value: res, context: [], message: "no document selected" }],
      })
    }
  }

  return (
    <>
      <Row style={{ marginBottom: 9 }}>
        <Paragraph>{i18n.t("backup_screen.import.description")}</Paragraph>
      </Row>
      {/*<Row style={{ marginBottom: 9 }}>
        <TextInput
          style={{
            ...textInputStyle,
            backgroundColor: "white",
          }}
          // \@ts-expect-error not sure why this isn't typed, but it makes this fill the width
          flex={1}
          placeholderTextColor={textInputPlaceholderColor}
          placeholder={props.archive}
          value={importText}
          multiline={true}
          numberOfLines={3}
          editable={true}
          selectTextOnFocus={true}
          onChange={(event) => {
            setImportText(event.nativeEvent.text)
            setArchiveWrite({ status: "init" })
          }}
        />
      </Row>
      <Row style={{ marginBottom: 9 }}>
        <ActionButton
          flex={1}
          title={i18n.t("backup_screen.import.clipboard.button")}
          fillColor="#EDF0FC"
          textColor={theme.darkBlue}
          onPress={onImportClipboard}
        />
      </Row>
        */}
      <Row style={{ marginBottom: 9 }}>
        <ActionButton
          flex={1}
          title={i18n.t("backup_screen.import.file.button")}
          fillColor="#EDF0FC"
          textColor={theme.darkBlue}
          onPress={onImportFile}
        />
      </Row>
      {AsyncState.fold(
        archiveWrite,
        () => null,
        () => null,
        (err) => (
          <Row style={{ marginBottom: 9 }}>
            {/* <Text>{i18n.t("backup_screen.import.clipboard.failure")}</Text> */}
            <Text>{i18n.t("backup_screen.import.file.failure")}</Text>
          </Row>
        ),
        () =>
          importText === props.archive ? (
            <Row style={{ marginBottom: 9 }}>
              <Text>{i18n.t("backup_screen.import.noop")}</Text>
            </Row>
          ) : (
            <Row style={{ marginBottom: 9 }}>
              <Text>{i18n.t("backup_screen.import.success")}</Text>
            </Row>
          )
      )}
    </>
  )
}
