import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useEffect } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { ModelLoadedProps } from "../hooks/use-model";
import { PromiseRender } from "../hooks/use-promise-state";

export function DownloadOrShareLink(props: {
  name: string;
  body: () => string;
  type?: string;
  UTI?: string; // IOS-only filetype id
  translate: ModelLoadedProps["translate"];
  error: (err: string) => React.ReactNode;
  share: (onPress: () => void) => React.ReactNode;
  download: () => React.ReactNode;
}) {
  if (Platform.OS === "web") {
    return <DownloadLink {...props}>{props.download()}</DownloadLink>;
  } else {
    return <ShareLink {...props}>{props.share}</ShareLink>;
  }
}

function ShareLink(props: {
  name: string;
  body: () => string;
  type?: string;
  UTI?: string; // IOS-only filetype id
  error: (err: string) => React.ReactNode;
  translate: ModelLoadedProps["translate"];
  children: (onPress: () => void) => React.ReactNode;
}) {
  const { name, body, type, UTI, error, translate: t, children } = props;
  return (
    <PromiseRender
      promise={Sharing.isAvailableAsync()}
      pending={() => <ActivityIndicator />}
      failure={(e) => error(e.message)}
      success={(isSharable) =>
        isSharable
          ? children(() => onShare(name, body, type, UTI))
          : // web can't share, but it should show <ExportDownloadWebLink> instead and never get here
            error(t("backup_screen.export.share.unavailable"))
      }
    />
  );
}

function DownloadLink(props: {
  name: string;
  body: () => string;
  type?: string;
  children: React.ReactNode;
}) {
  const { name, body, type, children } = props;
  const blob = new Blob([body()], { type });
  const url = URL.createObjectURL(blob);
  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  });
  return (
    // web platform only, so it's safe to use plain html here
    <a href={url} download={name}>
      {children}
    </a>
  );
}

async function onShare(
  name: string,
  body: () => string,
  mimeType?: string,
  UTI?: string
) {
  await withNamedTempFile(name, async (f) => {
    f.write(body());
    await Sharing.shareAsync(f.uri, { mimeType, UTI });
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
