import { z } from "zod";
import { localeTags } from "../hooks/use-i18n";

const prefix = `@SettingsStore:`;
// these names are from legacy code, could still be around in users' persisted state, be careful changing them
export const localeKey = `${prefix}locale`;
export const historyLabelsKey = `${prefix}history-button-labels`;
export const pincodeKey = `@Quirk:pincode`;
export const themeKey = `${prefix}theme`;

export const historyLabelsDefault = `alternative-thought` as const;

export const Json = z.object({
  [pincodeKey]: z.string().nullable(),
  [historyLabelsKey]: z.string().nullable(),
  [localeKey]: z.string().nullable(),
  [themeKey]: z.string().nullable(),
});
export type Json = z.infer<typeof Json>;
export type JsonKey = keyof typeof Json.shape;
export const keys = Object.keys(Json.shape) as readonly JsonKey[];

export const Settings = z.object({
  // all values should catch() - settings are not worth having an error handling flow, just use a default value instead
  pincode: z
    .string()
    .regex(/^[0-9]{4}$/)
    .nullable()
    .catch(null),
  historyLabels: z
    .enum(["alternative-thought", "automatic-thought"])
    .catch(historyLabelsDefault),
  locale: z.enum(localeTags).nullable().catch(null),
  theme: z.enum(["light", "dark"]).nullable().catch(null),
});
export type Settings = z.infer<typeof Settings>;
export type HistoryLabel = Settings["historyLabels"];
export type Pincode = Settings["pincode"];

export const fromJson = z.codec(Json, Settings, {
  decode: (json: Json) => {
    const {
      [pincodeKey]: pincode,
      [historyLabelsKey]: historyLabels,
      [localeKey]: locale,
      [themeKey]: theme,
    } = json;
    return Settings.parse({ pincode, historyLabels, locale, theme });
  },
  encode: (s: Settings) => {
    return Json.decode({
      [pincodeKey]: s.pincode,
      [historyLabelsKey]:
        s.historyLabels === historyLabelsDefault ? null : s.historyLabels,
      [localeKey]: s.locale,
      [themeKey]: s.theme,
    });
  },
});
