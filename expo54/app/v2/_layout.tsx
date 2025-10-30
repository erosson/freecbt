import { ColorSchemeProvider } from "@/src/hooks/use-color-scheme";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <ColorSchemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ColorSchemeProvider>
  );
}
