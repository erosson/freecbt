import { Href } from "expo-router";
import { Thought } from ".";
import * as Settings from "./settings";

export type Cmd =
  | typeof loadModel
  | ReturnType<
      | typeof writeSettings
      | typeof writeThought
      | typeof deleteThought
      | typeof navigate
    >;
export type List = readonly Cmd[];

export const loadModel = { cmd: "load-model" } as const;
export function writeSettings(value: Settings.Settings) {
  return { cmd: "write-settings", value } as const;
}
export function writeThought(value: Thought.Thought) {
  return { cmd: "write-thought", value } as const;
}
export function deleteThought(value: Thought.Key) {
  return { cmd: "delete-thought", value } as const;
}
export function navigate(value: Href) {
  return { cmd: "navigate", value } as const;
}
