import { Storage } from "@/src";
import { Action, Cmd, Distortion, DistortionData, Model } from "@/src/model";
import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Appearance, Dimensions } from "react-native";
import { createElmArch, useElmArch } from "./use-elm-arch";
import {
  defaultLocale,
  I18nProvider,
  TranslateFn,
  useTranslate,
} from "./use-i18n";
import { Style, useStyle } from "./use-style";

const Ctx = createElmArch<Model.Model, Action.Action, Cmd.Cmd>();

export function ModelProvider(props: { children: React.ReactNode }) {
  const runner = useCmdRunner(DistortionData, AsyncStorage);
  return (
    <Ctx.Provider init={Model.init} update={Model.update} runner={runner}>
      {props.children}
    </Ctx.Provider>
  );
}
export function ModelI18nProvider(props: { children: React.ReactNode }) {
  const [m] = useModel();
  const locale = Model.locale(m);
  return <I18nProvider locale={locale}>{props.children}</I18nProvider>;
}
export function useModel() {
  return useElmArch(Ctx);
}
export function LoadModel(props: {
  loading?: () => React.JSX.Element;
  ready: ModelLoadedComponent;
}): React.ReactNode {
  const [model, dispatch] = useModel();
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

  let lastDispatch: (a: Action.Action) => void = () => {};
  // TODO: some way to dispose these
  const acl = Appearance.addChangeListener((prefs) =>
    lastDispatch(Action.setDeviceColorScheme(prefs.colorScheme ?? null))
  );
  const dcl = Dimensions.addEventListener("change", (d) =>
    lastDispatch(Action.setDeviceWindow(d.window))
  );
  const timecl = setInterval(
    () => lastDispatch(Action.setNow(new Date())),
    100
  );

  return async (c: Cmd.Cmd, dispatch: (a: Action.Action) => void) => {
    lastDispatch = dispatch;
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
}
