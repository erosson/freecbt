import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Action, Archive, Model } from "@/src/model";
import { DownloadOrShareLink } from "@/src/view/download-or-share";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Backup() {
  return <LoadModel ready={Ready} />;
}
export function Ready(props: ModelLoadedProps) {
  const { model, dispatch, style: s, translate: t } = props;
  const parser = Archive.createParsers(model.distortionData);
  const toArchive = () => parser.fromString.encode(Model.toArchive(model));
  return (
    <SafeAreaView style={[s.view]}>
      <View style={[s.container]}>
        <Text style={[s.text, s.my2]}>
          {t("backup_screen.export.description")}
        </Text>
        <ExportLink toArchive={toArchive} style={s} translate={t} />
        <Text style={[s.text, s.my2]}>
          {t("backup_screen.import.description")}
        </Text>
        <ImportButton
          parser={parser}
          toArchive={toArchive}
          dispatch={dispatch}
          style={s}
          translate={t}
        />
      </View>
    </SafeAreaView>
  );
}

function ExportLink(
  props: Pick<ModelLoadedProps, "style" | "translate"> & {
    toArchive: () => string;
  }
) {
  const { style: s, translate: t, toArchive } = props;
  return (
    <DownloadOrShareLink
      name="FreeCBT-backup.txt"
      body={toArchive}
      type="text/plain"
      UTI="org.erosson.freecbt.backup"
      translate={t}
      error={(e) => <Text style={[s.errorText]}>{e}</Text>}
      share={(onPress) => (
        <TouchableOpacity style={[s.button, s.my2]} onPress={onPress}>
          <Text style={[s.buttonText]}>
            {t("backup_screen.export.share.button")}
          </Text>
        </TouchableOpacity>
      )}
      download={() => (
        <TouchableOpacity style={[s.button, s.my2]}>
          <Text style={[s.buttonText]}>
            {t("backup_screen.export.file.button")}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

function ImportButton(
  props: Pick<ModelLoadedProps, "dispatch" | "style" | "translate"> & {
    parser: ReturnType<typeof Archive.createParsers>;
    toArchive: () => string;
  }
) {
  const { style: s, translate: t } = props;
  const [importResult, setImportResult] = useState<string>("");
  return (
    <>
      <TouchableOpacity
        style={[s.button, s.my2]}
        onPress={() => onImport({ ...props, setImportResult })}
      >
        <Text style={[s.buttonText]}>
          {t("backup_screen.import.file.button")}
        </Text>
      </TouchableOpacity>
      <Text style={[s.text]}>{importResult}</Text>
    </>
  );
}

async function onImport(
  props: Pick<ModelLoadedProps, "dispatch" | "translate"> & {
    setImportResult: (s: string) => void;
    parser: ReturnType<typeof Archive.createParsers>;
    toArchive: () => string;
  }
) {
  const { toArchive, parser, dispatch, setImportResult, translate: t } = props;
  const res = await DocumentPicker.getDocumentAsync({
    type: ["text/plain"],
  });
  if (res.canceled || !res.assets[0]) return;
  const [asset] = res.assets;
  const body =
    // web
    (await asset.file?.text()) ??
    // mobile
    (await new FileSystem.File(asset.uri).text());
  // console.log("file", body);
  if (toArchive().trim() === body.trim()) {
    setImportResult(t("backup_screen.import.noop"));
  } else {
    const imported = parser.fromString.safeDecode(body);
    if (imported.success) {
      dispatch(Action.importArchive(imported.data));
      setImportResult(t("backup_screen.import.success"));
    } else {
      setImportResult(t("backup_screen.import.file.failure"));
    }
  }
}
