import _ from "lodash";
import { z } from "zod";
import type { LocaleTag } from "../hooks/use-i18n";
import * as Routes from "../routes";
import * as Action from "./action";
import * as Cmd from "./cmd";
import * as Distortion from "./distortion";
import * as Settings from "./settings";
import * as Thought from "./thought";
import * as Archive from "./thoughts-archive";

export type Model = Loading | Ready;
export type Loading = typeof loading;
export type ColorScheme = "light" | "dark";
export interface Ready {
  status: "ready";
  sessionAuthed: boolean;
  distortionData: Distortion.Data;
  thoughts: ReadonlyMap<Thought.Key, Thought.Thought>;
  thoughtParseErrors: ReadonlyMap<Thought.Key, z.ZodError<Thought.Thought>>;
  settings: Settings.Settings;
  deviceColorScheme: ColorScheme | null;
  deviceLocale: LocaleTag;
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
export function toArchive(m: Ready): Archive.Archive {
  return { thoughts: thoughtsList(m) };
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
  // Rookie mistake, string dates are not sorted the way we'd expect:
  // return _.sortBy(pairs, ([date]) => date).map(
  // Better, but re-parsing stringified dates feels a bit wasteful:
  // return _.sortBy(pairs, ([date]) => new Date(date).getTime()).map(
  // We know each thought-group has at least one entry, so let's do this:
  return (
    _.sortBy(pairs, ([date, thoughts]) => -thoughts[0].createdAt.getTime())
      // The thought-groups themselves must be sorted too:
      .map(([date, thoughts]) => [
        date,
        _.sortBy(thoughts, (t) => -t.createdAt.getTime()),
      ])
  );
}

export function update(m: Model, a: Action.Action): readonly [Model, Cmd.List] {
  switch (a.action) {
    case "model-ready": {
      const m2 = m.status === "loading" ? a.model : m;
      return [m2, []];
    }
    default: {
      if (m.status === "loading") return [m, []];
      return updateReady(m, a);
    }
  }
}
function updateReady(m: Ready, a: Action.Action): readonly [Model, Cmd.List] {
  switch (a.action) {
    case "model-ready": {
      return [m, []];
    }
    case "set-session-authed": {
      return [{ ...m, sessionAuthed: a.value }, []];
    }
    case "set-pincode": {
      return updateSettings(
        { ...m, sessionAuthed: !!a.value },
        { pincode: a.value }
      );
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
    case "set-existing-user": {
      return updateSettings(m, { existingUser: true });
    }
    case "set-reminders": {
      return updateSettings(m, { reminders: a.value });
    }
    case "set-device-color-scheme": {
      return [{ ...m, deviceColorScheme: a.value }, []];
    }
    case "create-thought": {
      return writeThought(m, Thought.create(a.spec, a.now));
    }
    case "update-thought": {
      return writeThought(m, a.value);
    }
    case "delete-thought": {
      const thoughts = new Map(m.thoughts);
      const k = Thought.keyFromId.decode(a.value);
      thoughts.delete(k);
      const m2: Model = { ...m, thoughts };
      return [m2, [Cmd.deleteThought(k)]];
    }
    case "import-archive": {
      const thoughts = new Map(
        a.value.thoughts.map((t) => [Thought.key(t), t] as const)
      );
      const m2: Model = { ...m, thoughts };
      return [
        m2,
        [
          ...thoughtsList(m).map((t) => Cmd.deleteThought(Thought.key(t))),
          ...a.value.thoughts.map((t) => Cmd.writeThought(t)),
        ],
      ];
    }
    default:
      throw new Error(`no such action: ${a satisfies never}`);
  }
}
function writeThought(
  m: Ready,
  thought: Thought.Thought
): readonly [Model, Cmd.List] {
  const thoughts = new Map(m.thoughts);
  thoughts.set(Thought.key(thought), thought);
  const m2: Model = { ...m, thoughts };
  const cmds = [
    Cmd.writeThought(thought),
    Cmd.navigate(Routes.thoughtViewV2(thought.uuid)),
  ];
  return [m2, cmds];
}
function updateSettings(
  m: Ready,
  s: Partial<Settings.Settings>
): readonly [Model, Cmd.List] {
  const m2: Model = { ...m, settings: { ...m.settings, ...s } };
  return [m2, [Cmd.writeSettings(m2.settings)]];
}
