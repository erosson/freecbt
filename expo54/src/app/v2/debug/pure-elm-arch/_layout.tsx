import { createPureElmArch } from "@/src/hooks/use-elm-arch";
import { Stack } from "expo-router";

export interface Model {
  value: number;
}
export function init(): Model {
  return { value: 0 };
}

export const incr = () => ({ action: "incr" } as const);
export const decr = () => ({ action: "decr" } as const);
export type Action = ReturnType<typeof incr | typeof decr>;

export function update(m: Model, a: Action): Model {
  switch (a.action) {
    case "incr":
      return { ...m, value: m.value + 1 };
    case "decr":
      return { ...m, value: m.value - 1 };
    default:
      throw new Error(a satisfies never);
  }
}

export const Ctx = createPureElmArch<Model, Action>();

export default function Layout() {
  return (
    <Ctx.Provider init={init()} update={update}>
      <Stack screenOptions={{ headerShown: false }} />
    </Ctx.Provider>
  );
}
