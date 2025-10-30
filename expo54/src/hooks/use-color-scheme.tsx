import React, { createContext, useContext } from "react";
import { Appearance } from "react-native";

export type ColorScheme = "light" | "dark";

type Ctx = [ColorScheme, (c: ColorScheme) => void];
const Ctx = createContext<Ctx | null>(null);

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
  const c = useContext(Ctx);
  if (c === null) {
    throw new Error(
      "You must use <ColorSchemeProvider> before useColorScheme()"
    );
  }
  return c;
}
