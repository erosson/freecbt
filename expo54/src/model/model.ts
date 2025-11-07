import { z } from "zod";
import type { LocaleTag } from "../hooks/use-i18n";
import * as Action from "./action";
import * as Cmd from "./cmd";
import * as Settings from "./settings";
import * as Thought from "./thought";

export type Model = Loading | Ready;
export type Loading = typeof loading;
export type ColorScheme = "light" | "dark";
export interface Ready {
  status: "ready";
  thoughts: ReadonlyMap<string, Thought.Thought>;
  thoughtParseErrors: ReadonlyMap<string, z.ZodError<Thought.Thought>>;
  settings: Settings.Settings;
  deviceColorScheme: ColorScheme | null;
  deviceLocale: LocaleTag;
  deviceWindow: { width: number; height: number };
}

export const loading = { status: "loading" } as const;
export const init: readonly [Model, Cmd.List] = [loading, [Cmd.loadModel]];
export function ready(p: Omit<Ready, "status">): Ready {
  return { status: "ready", ...p };
}

export interface Match<O> {
  ready: (m: Ready) => O;
  loading: (m: Loading) => O;
}
export function match<O>(m: Model, matcher: Match<O>): O {
  return matcher[m.status](m as any);
}

export function colorScheme(m: Model): ColorScheme {
  return match(m, {
    ready: (m) => m.settings.theme ?? m.deviceColorScheme ?? "light",
    loading: () => "light",
  });
}
export function locale(m: Model): LocaleTag {
  return match(m, {
    ready: (m) => m.settings.locale ?? m.deviceLocale ?? "en",
    loading: () => "en",
  });
}
export function update(m: Model, a: Action.Action): readonly [Model, Cmd.List] {
  switch (a.action) {
    case "model-ready": {
      const m2 = m.status === "loading" ? a.model : m;
      return [m2, []];
    }
    case "set-pincode": {
      return updateSettings(m, { pincode: a.value });
    }
    case "set-history-label": {
      return updateSettings(m, { historyLabels: a.value });
    }
    case "set-locale": {
      return updateSettings(m, { locale: a.value });
    }
    case "set-theme": {
      return updateSettings(m, { theme: a.value });
    }
    case "set-device-color-scheme": {
      return updateIfReady(m, { deviceColorScheme: a.value });
    }
    case "set-device-window": {
      return updateIfReady(m, { deviceWindow: a.value });
    }
    default: {
      const _e: never = a;
      throw new Error(`no such action: ${_e}`);
    }
  }
}
function updateSettings(
  m: Model,
  s: Partial<Settings.Settings>
): readonly [Model, Cmd.List] {
  if (m.status === "loading") return [m, []];
  const m2: Model = { ...m, settings: { ...m.settings, ...s } };
  return [m2, [Cmd.writeSettings(m2.settings)]];
}
function updateIfReady(
  m: Model,
  s: Partial<Ready>
): readonly [Model, Cmd.List] {
  if (m.status === "loading") return [m, []];
  const m2: Model = { ...m, ...s };
  return [m2, []];
}
