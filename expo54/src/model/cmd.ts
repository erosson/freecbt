import * as Settings from "./settings";

export type Cmd = typeof loadModel | ReturnType<typeof writeSettings>;
export type List = readonly Cmd[];

export const loadModel = { cmd: "load-model" } as const;
export function writeSettings(value: Settings.Settings) {
  return { cmd: "write-settings", value } as const;
}
