import { AppProvider } from "@/src/view/app-provider";
import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
}
