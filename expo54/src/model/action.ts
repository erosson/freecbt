import type { LocaleTag } from "@/src/hooks/use-i18n";
import { Thought } from ".";
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
  | typeof setNow
  | typeof createThought
  | typeof deleteThought
  | typeof updateThought
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
export function setNow(value: Date) {
  return { action: "set-now", value } as const;
}
export function createThought(value: Thought.Spec) {
  return { action: "create-thought", value } as const;
}
export function deleteThought(value: Thought.Id) {
  return { action: "delete-thought", value } as const;
}
export function updateThought(value: Thought.Thought) {
  return { action: "update-thought", value } as const;
}
