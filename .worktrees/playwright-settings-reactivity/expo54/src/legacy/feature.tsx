/**
 * Feature flags. Enable/disable parts of the app.
 *
 * These are viewed - and changed - via the secret debug screen. On the settings
 * screen, at the bottom, tap the blank space 5 times.
 *
 * These flags are stored in-memory. Changes are lost when the app restarts.
 *
 * Usage:
 * - Anywhere in the app that depends on a feature flag:
 *
 *     function MyComponent(props) {
 *       const {feature, updateFeature} = useContext(Feature.Context);
 *       return (
 *         // render component
 *       );
 *     }
 *
 *   or
 *
 *     <Feature.Context.Consumer>
 *     {({feature, updateFeature} =>
 *       // render component
 *     )}
 *     </Feature.Context.Consumer>
 *
 * - At the top level of the app:
 *
 *     Feature.withState(AppComponent)
 *
 *   or
 *
 *     <Feature.State>
 *       <AppComponent />
 *     </Feature.State>
 */
import React from "react";
import { Platform } from "react-native";

export interface Feature {
  debugVisible: boolean;
  reminders: boolean;
  remindersEachMinute: boolean;
  localeSetting: boolean;
  testLocalesVisible: boolean;
  extendedDistortions: boolean;
}
export const defaults: Feature = {
  debugVisible: false,
  reminders: Platform.OS === "ios",
  remindersEachMinute: false,
  localeSetting: true,
  testLocalesVisible: false,
  extendedDistortions: false,
  // extendedDistortions: true,
};

export type Context = { feature: Feature; updateFeature: (a: object) => void };
export const Context = React.createContext<Context>({
  feature: defaults,
  updateFeature: (action: object) => {},
});

export function State({
  children,
}: React.PropsWithChildren<object>): React.JSX.Element {
  const [feature, updateFeature] = React.useReducer(
    (state: Feature, newState: Partial<Feature>): Feature => ({
      ...state,
      ...newState,
    }),
    defaults
  );
  return (
    <Context.Provider value={{ feature, updateFeature }}>
      {children}
    </Context.Provider>
  );
}
export function useFeatureContext(): Context {
  return React.useContext(Context);
}

const featureKeys = Object.keys(defaults) as (keyof Feature)[];
export const useFeature = Object.fromEntries(
  featureKeys.map((k) => [k, () => useFeatureContext().feature[k]])
) as { [f in keyof Feature]: () => Feature[f] };
