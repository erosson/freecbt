import type { LocaleTag } from "@/src/hooks/use-i18n";
import { Archive, Thought } from ".";
import * as Model from "./model";
import * as Settings from "./settings";

export type Action = ReturnType<
  | typeof modelReady
  | typeof setSessionAuthed
  | typeof setExistingUser
  | typeof setReminders
  | typeof setPincode
  | typeof setHistoryLabel
  | typeof setLocale
  | typeof setTheme
  | typeof setDeviceColorScheme
  | typeof createThought
  | typeof deleteThought
  | typeof updateThought
  | typeof importArchive
>;
export type Dispatch = (a: Action) => void;

export function setSessionAuthed(value: boolean) {
  return { action: "set-session-authed", value } as const;
}
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
export function setExistingUser() {
  return { action: "set-existing-user" } as const;
}
export function setReminders(value: boolean) {
  return { action: "set-reminders", value } as const;
}
export function modelReady(model: Model.Ready) {
  return { action: "model-ready", model } as const;
}
export function setDeviceColorScheme(value: Model.Ready["deviceColorScheme"]) {
  return { action: "set-device-color-scheme", value } as const;
}
export function createThought(spec: Thought.Spec, now: Date) {
  return { action: "create-thought", spec, now } as const;
}
export function deleteThought(value: Thought.Id) {
  return { action: "delete-thought", value } as const;
}
export function updateThought(value: Thought.Thought) {
  return { action: "update-thought", value } as const;
}
export function importArchive(value: Archive.Archive) {
  return { action: "import-archive", value } as const;
}
