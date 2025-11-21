import { Stack } from "expo-router";
import { createContext, useReducer } from "react";

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
    default: {
      const e: never = a;
      throw new Error(e);
    }
  }
}

export type Ctx = [Model, (a: Action) => void];
export const Ctx = createContext<Ctx>(undefined as any as Ctx);

// export default function Layout(props: { children: React.ReactNode }) {
export default function Layout() {
  const [model, dispatch] = useReducer(update, init());
  // return props.children;
  return (
    <Ctx.Provider value={[model, dispatch]}>
      <Stack screenOptions={{ headerShown: false }} />
    </Ctx.Provider>
  );
}
