import { ColorSchemeProvider } from "@/src/hooks/use-color-scheme";
import { I18nProvider } from "@/src/hooks/use-i18n";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <ColorSchemeProvider>
      <I18nProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </I18nProvider>
    </ColorSchemeProvider>
  );
}
