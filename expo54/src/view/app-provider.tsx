import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nProvider } from "../hooks/use-i18n";
import { ModelProvider, useModel } from "../hooks/use-model";
import { Model } from "../model";
import { AuthGateway } from "./auth-gateway";
import { OnboardingGateway } from "./onboarding-gateway";

export function ModelI18nProvider(props: { children: React.ReactNode }) {
  const [m] = useModel();
  const locale = Model.locale(m);
  return <I18nProvider locale={locale}>{props.children}</I18nProvider>;
}
export function AppProvider(props: { children: React.ReactNode }) {
  return (
    <ModelProvider>
      <ModelI18nProvider>
        <OnboardingGateway>
          <AuthGateway>
            <SafeAreaProvider>{props.children}</SafeAreaProvider>
          </AuthGateway>
        </OnboardingGateway>
      </ModelI18nProvider>
    </ModelProvider>
  );
}
