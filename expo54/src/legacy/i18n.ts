import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import locals from "../locals";
import { LOCALE_KEY } from "./setting";
import { getSetting } from "./setting/settingstore";

function walkReverse(obj: object): object | string {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key,
      typeof val === "string"
        ? val.split("").reverse().join("")
        : walkReverse(val),
    ])
  );
}

const i18n = new I18n({
  ...locals,
  // testing with an obviously-transformed language makes it easy to find and
  // remove hardcoded strings. Hidden behind `feature.testLocalesVisible`.
  _test: walkReverse(locals.en),
});

i18n.enableFallback = true;
// i18n.locale = Localization.locale
i18n.locale = Localization.getLocales()[0].languageTag;

async function loadLocaleSetting() {
  // const locale = isPlatformSupported() ? await getSetting(LOCALE_KEY) : null;
  const locale =
    typeof window !== "undefined" ? await getSetting(LOCALE_KEY) : null;
  if (locale) {
    i18n.locale = locale;
  }
}
loadLocaleSetting();

export default i18n;
