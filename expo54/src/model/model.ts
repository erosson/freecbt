import _ from "lodash";
import { z } from "zod";
import { Routes } from "..";
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
  now: Date;
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
export function thoughtsList(m: Ready): readonly Thought.Thought[] {
  return _.sortBy(Array.from(m.thoughts.values()), (t) => t.createdAt);
}

type Pair<A, B> = readonly [A, B];
export function thoughtsByDate(
  m: Ready
): readonly Pair<string, readonly Thought.Thought[]>[] {
  const g = _.groupBy(thoughtsList(m), (t) => t.createdAt.toDateString());
  const pairs = Object.entries(g) as readonly Pair<
    string,
    readonly Thought.Thought[]
  >[];
  return _.sortBy(pairs, ([date]) => date);
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
      return updateFieldsIfReady(m, { deviceColorScheme: a.value });
    }
    case "set-device-window": {
      return updateFieldsIfReady(m, { deviceWindow: a.value });
    }
    case "set-now": {
      return updateFieldsIfReady(m, { now: a.value });
    }
    case "create-thought": {
      if (m.status === "loading") return [m, []];
      const thought = Thought.create(a.value, m.now);
      const thoughts = new Map(m.thoughts);
      thoughts.set(thought.uuid, thought);
      const m2: Model = { ...m, thoughts };
      const cmds = [
        Cmd.writeThought(thought),
        Cmd.navigate(Routes.thoughtListV2()),
      ];
      return [m2, cmds];
    }
    case "delete-thought": {
      if (m.status === "loading") return [m, []];
      const thoughts = new Map(m.thoughts);
      thoughts.delete(a.value);
      const m2: Model = { ...m, thoughts };
      return [m2, [Cmd.deleteThought(Thought.keyFromId.decode(a.value))]];
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
function updateFieldsIfReady(
  m: Model,
  s: Partial<Ready>
): readonly [Model, Cmd.List] {
  if (m.status === "loading") return [m, []];
  const m2: Model = { ...m, ...s };
  return [m2, []];
}
