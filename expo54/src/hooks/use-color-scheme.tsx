import React, { createContext, useContext } from "react";
import { Appearance } from "react-native";

export type ColorScheme = "light" | "dark";

type Ctx = [ColorScheme, (c: ColorScheme) => void];
const Ctx = createContext<Ctx>(undefined as any as Ctx);

export function ColorSchemeProvider(props: { children: React.ReactNode }) {
  return (
    <Ctx
      value={[
        Appearance.getColorScheme() ?? "light",
        Appearance.setColorScheme,
      ]}
    >
      {props.children}
    </Ctx>
  );
}

export function useColorScheme(): Ctx {
  return useContext(Ctx);
}
