import { Storage } from "@/src";
import { Action, Cmd, Distortion, DistortionData, Model } from "@/src/model";
import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { ActivityIndicator, Appearance } from "react-native";
import { defaultLocale, I18nProvider } from "./use-i18n";

export type Ctx = readonly [Model.Model, (a: Action.Action) => void];
const Ctx = createContext<Ctx | null>(null);

type CmdRunner = (c: Cmd.Cmd, d: (a: Action.Action) => void) => void;

export function ModelProvider(props: {
  runner?: CmdRunner;
  children: React.ReactNode;
}) {
  const runner = props.runner ?? defaultCmdRunner;
  const [[model, lastCmds], dispatch] = useReducer(
    ([m], a) => Model.update(m, a),
    Model.init
  );
  useEffect(() => {
    for (const cmd of lastCmds) {
      runner(cmd, dispatch);
    }
  }, [runner, lastCmds]);
  return <Ctx value={[model, dispatch]}>{props.children}</Ctx>;
}
export function ModelI18nProvider(props: { children: React.ReactNode }) {
  const [m] = useModel();
  const locale = Model.locale(m);
  return <I18nProvider locale={locale}>{props.children}</I18nProvider>;
}
export function useModel(): Ctx {
  const x = useContext(Ctx);
  if (x === null) {
    throw new Error("You must use <ModelProvider> before useModel()");
  }
  return x;
}

export function modelSpinner(
  m: Model.Model,
  ready: (m: Model.Ready) => React.JSX.Element
) {
  return Model.match(m, {
    loading: () => <ActivityIndicator />,
    ready,
  });
}

export function createCmdRunner(
  data: Distortion.Data,
  storage: AsyncStorageStatic
) {
  const s = Storage.settings(storage);
  const t = Storage.thoughts(data, storage);
  return async (c: Cmd.Cmd, dispatch: (a: Action.Action) => void) => {
    switch (c.cmd) {
      case "load-model": {
        if (typeof window === "undefined") return; // web platform ssr + asyncstorage bugs out
        // const [settings, tm] = await Promise.all([s.read(), t.readAll()]);
        const settings = await s.read();
        const tm = await t.readAll();
        const deviceColorScheme = Appearance.getColorScheme() ?? null;
        const deviceLocale = defaultLocale();
        const m = Model.ready({
          deviceColorScheme,
          deviceLocale,
          settings,
          ...tm,
        });
        dispatch(Action.modelReady(m));
        return;
      }
      case "write-settings": {
        s.write(c.value);
        return;
      }
      default: {
        const _e: never = c;
        throw new Error(`no such cmd: ${_e}`);
      }
    }
  };
}

const defaultCmdRunner = createCmdRunner(DistortionData, AsyncStorage);
