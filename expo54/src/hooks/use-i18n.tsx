import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import { createContext, useContext } from "react";
import { z } from "zod";
import locals0 from "../locals";
import en from "../locals/en.json";

// Type-safe, autocompletable translation keys!
export function useTranslate() {
  const i18n = useI18n();
  return (k: TranslateKey) => i18n.t(k);
}
export type TranslateFn = ReturnType<typeof useTranslate>;

export function I18nProvider(props: {
  locale: LocaleTag;
  children: React.ReactNode;
}) {
  const i18n = new I18n(locals);
  i18n.enableFallback = true;
  // i18n.locale = defaultLocale();
  i18n.locale = props.locale;

  // const settings = useSettingsStorage(AsyncStorage);
  //useEffect(() => {
  //  (async () => {
  //    i18n.locale = (await loadLocaleSetting(settings)) ?? i18n.locale;
  //  })();
  //});
  return <Ctx value={i18n}>{props.children}</Ctx>;
}

export function useI18n(): I18n {
  const l = useContext(Ctx);
  if (l === null) {
    throw new Error("You must use <I18nProvider> before useI18n()");
  }
  return l;
}

const locals = {
  ...locals0,
  // testing with an obviously-transformed language makes it easy to find and
  // remove hardcoded strings. Hidden behind `feature.testLocalesVisible`.
  _test: walkReverse(locals0.en),
};
export type LocaleTag = keyof typeof locals;
export const localeTags = Object.keys(locals).sort() as readonly LocaleTag[];
export const LocaleTag = z.union(localeTags.map((name) => z.literal(name)));

const Ctx = createContext<I18n | null>(null);

/**
 * Create a copy of a language with all text reversed.
 */
function walkReverse<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key,
      typeof val === "string"
        ? val.split("").reverse().join("")
        : walkReverse(val),
    ])
  ) as T;
}

export function defaultLocale(): LocaleTag {
  // use one of the user's preferred locale by default
  for (const loc of Localization.getLocales()) {
    // parsing fails if the user prefers a language we don't have a translation for
    const res = LocaleTag.safeParse(loc.languageTag);
    if (res.success) {
      return res.data;
    }
  }
  // if the user prefers none of our translated languages, give up and default to english
  return "en";
}

//async function loadLocaleSetting(
//  settings: SettingsStorage
//): Promise<LocaleTag | null> {
//  // const locale = isPlatformSupported() ? await getSetting(LOCALE_KEY) : null;
//  if (typeof window !== "undefined") {
//    return null;
//  }
//  const setting = LocaleTag.safeParse(await settings.read(LOCALE_KEY));
//  // error reporting isn't worth it here, fallback to the system default
//  return setting.success ? setting.data : null;
//}

// json {"a": {"b": "c", "d": "e"}} -> type "a.b" | "a.d"
// stolen from https://www.raygesualdo.com/posts/flattening-object-keys-with-typescript-types/
type FlattenKeys<
  T extends Record<string, unknown>,
  Key = keyof T
> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? `${Key}.${FlattenKeys<T[Key]>}`
    : `${Key}`
  : never;
export type TranslateKey = FlattenKeys<typeof en>;

type TranslateJson = { [k: string]: string | TranslateJson };
function flattenKeys(o: TranslateJson): { [k: string]: string } {
  return Object.fromEntries(
    Object.entries(o).flatMap(([k, v]) =>
      typeof v === "string"
        ? [[k, v]]
        : Object.entries(flattenKeys(v)).map(([k2, v2]) => [`${k}.${k2}`, v2])
    )
  );
}
export const translateKeys = Object.keys(
  flattenKeys(en)
) as readonly TranslateKey[];
export const translateKeySet = new Set<string>(translateKeys);
