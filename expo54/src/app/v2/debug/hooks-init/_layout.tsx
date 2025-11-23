/**
 * freecbt handles its state with use-elm-arch: useReducer + the command pattern for side effects.
 * however, the more common way to do things in react is to put side effects inside action creators.
 * this page is an experiment where we that out.
 *
 * I think I like the elm-style more, though!
 */
import { Stack } from "expo-router";
import { createContext, useEffect, useReducer } from "react";
import { useWindowDimensions } from "react-native";

export interface Model {
  value: number;
  deviceWindow: { width: number; height: number };
}
export function init(deviceWindow: Model["deviceWindow"]): Model {
  return { value: 0, deviceWindow };
}

export const incr = () => ({ action: "incr" } as const);
export const decr = () => ({ action: "decr" } as const);
export const resize = (deviceWindow: Model["deviceWindow"]) =>
  ({ action: "resize", deviceWindow } as const);
export type Action = ReturnType<typeof incr | typeof decr | typeof resize>;

export function update(m: Model, a: Action): Model {
  switch (a.action) {
    case "incr":
      return { ...m, value: m.value + 1 };
    case "decr":
      return { ...m, value: m.value - 1 };
    case "resize":
      return { ...m, deviceWindow: a.deviceWindow };
    default:
      throw new Error(a satisfies never);
  }
}

export type Ctx = [Model, (a: Action) => void];
export const Ctx = createContext<Ctx>(undefined as any as Ctx);

export function useModelInit() {
  const w = useWindowDimensions();
  const [model, dispatch] = useReducer(update, init(w));
  useEffect(() => dispatch(resize(w)), [w]);
  return [model, dispatch] as const;
}

// export default function Layout(props: { children: React.ReactNode }) {
export default function Layout() {
  const [model, dispatch] = useModelInit();

  // return props.children;
  return (
    <Ctx.Provider value={[model, dispatch]}>
      <Stack screenOptions={{ headerShown: false }} />
    </Ctx.Provider>
  );
}
