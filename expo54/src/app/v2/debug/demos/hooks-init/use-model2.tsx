/**
 * A currently-unused experimental rewrite of useModel.
 *
 * this removed the elm-style command pattern from updates. instead, we're
 * using a plain reducer, and side effects happen in action creators - the
 * more common react pattern.
 *
 * abandoned, because it's not worth rewriting the rest of the app to fit this,
 * and I like the elm style anyway.
 */
import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import {
  ActivityIndicator,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { Storage } from "../../../../..";
import {
  defaultLocale,
  TranslateFn,
  useTranslate,
} from "../../../../../hooks/use-i18n";
import { Style, useStyle } from "../../../../../hooks/use-style";
import {
  Action,
  Distortion,
  DistortionData,
  Model,
  Thought,
} from "../../../../../model";

export default function UNUSED() {
  return <></>;
}

const Ctx = createContext<readonly [Model.Model, (a: Action.Action) => void]>([
  Model.loading,
  () => {},
]);

export function Model2Provider(props: {
  data?: Distortion.Data;
  storage?: AsyncStorageStatic;
  children: React.ReactNode;
}) {
  const data = props.data ?? DistortionData;
  const storage = props.storage ?? AsyncStorage;
  const md = useModelInit(data, storage);
  return <Ctx.Provider value={md}>{props.children}</Ctx.Provider>;
}

export function useModel2(ctx?: typeof Ctx) {
  return useContext(Ctx);
}
function useModelInit(
  data: Distortion.Data,
  storage: AsyncStorageStatic
): [Model.Model, (a: Action.Action) => void] {
  const s = Storage.settings(storage);
  const t = Storage.thoughts(data, storage);
  // TODO some of these side-effect-y fields should be removed from the model and happen only in views/action-creators instead. especially time!
  // this was a result of me trying to write Elm in React, instead of properly learning React's style.
  const w = useWindowDimensions();
  const cs = useColorScheme() ?? null;
  const deviceLocale = defaultLocale();
  const [model, dispatch] = useReducer(update, Model.loading);
  useEffect(() => dispatch(Action.setDeviceColorScheme(cs)), [cs]);

  useEffect(() => {
    (async () =>
      dispatch(
        Action.modelReady(
          Model.ready({
            sessionAuthed: false,
            distortionData: DistortionData,
            deviceColorScheme: cs,
            deviceLocale,
            settings: await s.read(),
            ...(await t.readAll()),
          })
        )
      ))();
  });
  return [model, dispatch];
}

export function LoadModel2(props: {
  ctx?: typeof Ctx;
  loading?: () => React.JSX.Element;
  ready: ModelLoadedComponent;
}): React.ReactNode {
  const [model, dispatch] = useModel2(props.ctx);
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

function update(m: Model.Model, a: Action.Action): Model.Model {
  switch (m.status) {
    case "loading": {
      return a.action === "model-ready" ? a.model : m;
    }
    case "ready": {
      return updateReady(m, a);
    }
    default:
      throw new Error(`no such model-status: ${m satisfies never}`);
  }
}

function updateReady(m: Model.Ready, a: Action.Action): Model.Ready {
  switch (a.action) {
    case "model-ready": {
      return m;
    }
    case "create-thought": {
      const t = Thought.create(a.spec, a.now);
      const thoughts = mapMap(m.thoughts, (ts) => ts.set(Thought.key(t), t));
      return { ...m, thoughts };
    }
    case "update-thought": {
      const t = a.value;
      const thoughts = mapMap(m.thoughts, (ts) => ts.set(Thought.key(t), t));
      return { ...m, thoughts };
    }
    case "delete-thought": {
      const k = Thought.keyFromId.decode(a.value);
      const thoughts = mapMap(m.thoughts, (ts) => ts.delete(k));
      return { ...m, thoughts };
    }
    case "import-archive": {
      const thoughts = new Map(
        a.value.thoughts.map((t) => [Thought.key(t), t] as const)
      );
      return { ...m, thoughts };
    }
    case "set-history-label": {
      return { ...m, settings: { ...m.settings, historyLabels: a.value } };
    }
    case "set-locale": {
      return { ...m, settings: { ...m.settings, locale: a.value } };
    }
    case "set-pincode": {
      return {
        ...m,
        settings: { ...m.settings, pincode: a.value },
        sessionAuthed: !!a.value,
      };
    }
    case "set-theme": {
      return { ...m, settings: { ...m.settings, theme: a.value } };
    }
    case "set-existing-user": {
      return { ...m, settings: { ...m.settings, existingUser: true } };
    }
    case "set-device-color-scheme": {
      return { ...m, deviceColorScheme: a.value };
    }
    case "set-session-authed": {
      return { ...m, sessionAuthed: a.value };
    }
    default:
      throw new Error(`no such action: ${a satisfies never}`);
  }
}

/**
 * map (verb, transform) over a map (noun, dictionary data structure). sometimes English sucks
 */
function mapMap<K, V>(
  m0: ReadonlyMap<K, V>,
  fn: (ts: Map<K, V>) => void
): ReadonlyMap<K, V> {
  const m1 = new Map(m0);
  fn(m1);
  return m1;
}
