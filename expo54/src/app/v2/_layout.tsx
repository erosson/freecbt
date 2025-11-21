import { AppProvider } from "@/src/hooks/use-model";
import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
}
