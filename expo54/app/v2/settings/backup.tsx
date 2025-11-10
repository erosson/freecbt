// TODO 2025/11/10: not yet tested on ios
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { PromiseRender } from "@/src/hooks/use-promise-state";
import { Action, Archive, Model } from "@/src/model";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Backup() {
  return <LoadModel ready={Ready} />;
}
export function Ready(props: ModelLoadedProps) {
  const { model, dispatch, style: s, translate: t } = props;
  const parser = Archive.createParsers(model.distortionData);
  const toArchive = () => parser.fromString.encode(Model.toArchive(model));
  return (
    <View style={[s.view]}>
      <View style={[s.container]}>
        <Text style={[s.header]}>{t("backup_screen.header")}</Text>
        <Text style={[s.text]}>{t("backup_screen.export.description")}</Text>
        {Platform.OS === "web" ? (
          <ExportDownloadWebLink
            toArchive={toArchive}
            style={s}
            translate={t}
          />
        ) : (
          <ExportShareLink toArchive={toArchive} style={s} translate={t} />
        )}
        <Text style={[s.text]}>{t("backup_screen.import.description")}</Text>
        <ImportButton
          parser={parser}
          toArchive={toArchive}
          dispatch={dispatch}
          style={s}
          translate={t}
        />
      </View>
    </View>
  );
}

function ImportButton(
  props: Pick<ModelLoadedProps, "dispatch" | "style" | "translate"> & {
    parser: ReturnType<typeof Archive.createParsers>;
    toArchive: () => string;
  }
) {
  const { toArchive, parser, dispatch, style: s, translate: t } = props;
  const [importResult, setImportResult] = useState<string>("");
  async function onImport() {
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
  return (
    <>
      <TouchableOpacity style={[s.button]} onPress={onImport}>
        <Text style={[s.buttonText]}>
          {t("backup_screen.import.file.button")}
        </Text>
      </TouchableOpacity>
      <Text style={[s.text]}>{importResult}</Text>
    </>
  );
}

function ExportDownloadWebLink(
  props: Pick<ModelLoadedProps, "style" | "translate"> & {
    toArchive: () => string;
  }
) {
  const { style: s, translate: t, toArchive } = props;
  const blob = new Blob([toArchive()], {
    type: "text/plain",
  });
  const url = URL.createObjectURL(blob);
  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  });
  return (
    // web platform only, so it's safe to use plain html here
    <a href={url} download="FreeCBT-backup.txt">
      <TouchableOpacity style={[s.button]}>
        <Text style={[s.buttonText]}>
          {t("backup_screen.export.file.button")}
        </Text>
      </TouchableOpacity>
    </a>
  );
}
function ExportShareLink(
  props: Pick<ModelLoadedProps, "style" | "translate"> & {
    toArchive: () => string;
  }
) {
  const { style: s, translate: t, toArchive } = props;
  return (
    <PromiseRender
      promise={Sharing.isAvailableAsync()}
      pending={() => <ActivityIndicator />}
      failure={(e) => <Text style={[s.text]}>{e.message}</Text>}
      success={(isSharable) =>
        isSharable ? (
          <TouchableOpacity
            style={[s.button]}
            onPress={onExportShare(toArchive)}
          >
            <Text style={[s.buttonText]}>
              {t("backup_screen.export.share.button")}
            </Text>
          </TouchableOpacity>
        ) : (
          // web can't share, but it should show <ExportDownloadWebLink> instead and never get here
          <Text style={[s.errorText]}>
            {t("backup_screen.export.share.unavailable")}
          </Text>
          // <TouchableOpacity
          //   style={[s.button]}
          //   onPress={onExportFile(toArchive)}
          // >
          //   <Text style={[s.buttonText]}>
          //     {t("backup_screen.export.file.button")}
          //   </Text>
          // </TouchableOpacity>
        )
      }
    />
  );
}

function onExportShare(toArchive: () => string) {
  return async () =>
    await withNamedTempFile("FreeCBT-backup.txt", async (f) => {
      f.write(toArchive()); // surprisingly, not async
      await Sharing.shareAsync(f.uri, {
        UTI: "org.erosson.freecbt.backup",
        mimeType: "text/plain",
      });
    });
}
async function withNamedTempFile<O>(
  name: string,
  fn: (f: FileSystem.File) => Promise<O>
) {
  const f = new FileSystem.File(FileSystem.Paths.cache, name);
  tryDelete(f);
  f.create(); // surprisingly, not async
  try {
    return await fn(f);
  } finally {
    tryDelete(f);
  }
}
function tryDelete(f: FileSystem.File) {
  try {
    f.delete(); // surprisingly, not async
  } catch {
    // sometimes won't exist, that's fine, ignore it
  }
}
