import { useDefaultStyle } from "@/src/hooks/use-style";
import { AppProvider } from "@/src/view/app-provider";
import Drawer from "expo-router/drawer";
import React from "react";
import { useDrawerOptions } from "../(public)/_layout";

export default function Layout() {
  const s = useDefaultStyle();
  return (
    <AppProvider>
      <Drawer screenOptions={useDrawerOptions(s)}>
        <Drawer.Screen
          name="index"
          options={{ title: "developer debug page" }}
        />
      </Drawer>
    </AppProvider>
  );
}
