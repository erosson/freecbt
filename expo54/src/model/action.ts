import type { LocaleTag } from "@/src/hooks/use-i18n";
import * as Model from "./model";
import * as Settings from "./settings";

export type Action = ReturnType<
  | typeof modelReady
  | typeof setPincode
  | typeof setHistoryLabel
  | typeof setLocale
  | typeof setTheme
  | typeof setDeviceColorScheme
  | typeof setDeviceWindow
>;
export type Dispatch = (a: Action) => void;

export function setTheme(value: Model.ColorScheme | null) {
  return { action: "set-theme", value } as const;
}
export function setLocale(value: LocaleTag | null) {
  return { action: "set-locale", value } as const;
}
export function setHistoryLabel(value: Settings.HistoryLabel) {
  return { action: "set-history-label", value } as const;
}
export function setPincode(value: Settings.Pincode | null) {
  return { action: "set-pincode", value } as const;
}
export function modelReady(model: Model.Ready) {
  return { action: "model-ready", model } as const;
}
export function setDeviceColorScheme(value: Model.Ready["deviceColorScheme"]) {
  return { action: "set-device-color-scheme", value } as const;
}
export function setDeviceWindow(value: Model.Ready["deviceWindow"]) {
  return { action: "set-device-window", value } as const;
}
