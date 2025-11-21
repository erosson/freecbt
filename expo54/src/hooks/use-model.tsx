import { Storage } from "@/src";
import { Action, Cmd, Distortion, DistortionData, Model } from "@/src/model";
import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Appearance, Dimensions } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createElmArch, useElmArch } from "./use-elm-arch";
import {
  defaultLocale,
  I18nProvider,
  TranslateFn,
  useTranslate,
} from "./use-i18n";
import { Style, useStyle } from "./use-style";

const Ctx = createElmArch<Model.Model, Action.Action, Cmd.Cmd>();

export function ModelProvider(props: {
  ctx?: typeof Ctx;
  children: React.ReactNode;
}) {
  const runner = useCmdRunner(DistortionData, AsyncStorage);
  const ctx = props.ctx ?? Ctx;
  return (
    <ctx.Provider init={Model.init} update={Model.update} runner={runner}>
      {props.children}
    </ctx.Provider>
  );
}
export function ModelI18nProvider(props: {
  ctx?: typeof Ctx;
  children: React.ReactNode;
}) {
  const [m] = useModel(props.ctx);
  const locale = Model.locale(m);
  return <I18nProvider locale={locale}>{props.children}</I18nProvider>;
}
export function AppProvider(props: {
  ctx?: typeof Ctx;
  children: React.ReactNode;
}) {
  return (
    <ModelProvider ctx={props.ctx}>
      <ModelI18nProvider ctx={props.ctx}>
        <SafeAreaProvider>{props.children}</SafeAreaProvider>
      </ModelI18nProvider>
    </ModelProvider>
  );
}

export function useModel(ctx?: typeof Ctx) {
  return useElmArch(ctx ?? Ctx);
}
export function LoadModel(props: {
  ctx?: typeof Ctx;
  loading?: () => React.JSX.Element;
  ready: ModelLoadedComponent;
}): React.ReactNode {
  const [model, dispatch] = useModel(props.ctx);
  const style = useStyle(Model.colorScheme(model));
  const translate = useTranslate();
  return Model.match(model, {
    loading: props.loading ?? (() => <ActivityIndicator />),
    ready: (model) => (
      <props.ready
        model={model}
        dispatch={dispatch}
        style={style}
        translate={translate}
      />
    ),
  });
}
export interface ModelLoadedProps {
  model: Model.Ready;
  dispatch: (a: Action.Action) => void;
  style: Style;
  translate: TranslateFn;
}
export type ModelLoadedComponent = (props: ModelLoadedProps) => React.ReactNode;

function useCmdRunner(data: Distortion.Data, storage: AsyncStorageStatic) {
  const s = Storage.settings(storage);
  const t = Storage.thoughts(data, storage);
  const router = useRouter();
  // usually mutable stuff should be done with useState() in react, but here it blows up, and I couldn't solve why.
  let dispatch: (a: Action.Action) => void = () => {};

  useEffect(() => {
    const l = Appearance.addChangeListener((prefs) =>
      dispatch(Action.setDeviceColorScheme(prefs.colorScheme ?? null))
    );
    return () => l.remove();
  }, []);
  useEffect(() => {
    const l = Dimensions.addEventListener("change", (d) =>
      dispatch(Action.setDeviceWindow(d.window))
    );
    return () => l.remove();
  }, []);
  useEffect(() => {
    const l = setInterval(() => dispatch(Action.setNow(new Date())), 1000);
    return () => clearInterval(l);
  }, []);

  return (d: (a: Action.Action) => void) => {
    dispatch = d;
    return async (c: Cmd.Cmd) => {
      switch (c.cmd) {
        case "load-model": {
          if (typeof window === "undefined") return; // web platform ssr + asyncstorage bugs out
          // const [settings, tm] = await Promise.all([s.read(), t.readAll()]);
          const settings = await s.read();
          const tm = await t.readAll();
          const now = new Date();
          const deviceLocale = defaultLocale();
          const deviceColorScheme = Appearance.getColorScheme() ?? null;
          const deviceWindow = Dimensions.get("window");
          const m = Model.ready({
            now,
            sessionAuthed: false,
            distortionData: DistortionData,
            deviceColorScheme,
            deviceLocale,
            deviceWindow,
            settings,
            ...tm,
          });
          dispatch(Action.modelReady(m));
          return;
        }
        case "write-settings": {
          await s.write(c.value);
          return;
        }
        case "write-thought": {
          await t.write(c.value);
          return;
        }
        case "delete-thought": {
          await t.remove(c.value);
          return;
        }
        // TODO delete this, it's better for forms to return <Redirect href=...> when they're done
        case "navigate": {
          router.navigate(c.value);
          return;
        }
        default: {
          const _e: never = c;
          throw new Error(`no such cmd: ${_e}`);
        }
      }
    };
  };
}
