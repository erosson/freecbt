import { ModelI18nProvider, ModelProvider } from "@/src/hooks/use-model";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <ModelProvider>
      <ModelI18nProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ModelI18nProvider>
    </ModelProvider>
  );
}
