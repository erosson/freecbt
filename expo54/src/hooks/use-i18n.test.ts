import { localeName, localeTags } from "./use-i18n";
import de from "../locals/de.json";
import en from "../locals/en.json";

test("locale names always come from the English catalog", () => {
  expect(de.settings.locale.list).not.toHaveProperty("bg");
  expect(localeName("bg")).toBe("български");

  for (const locale of localeTags) {
    expect(localeName(locale)).toBe(en.settings.locale.list[locale]);
  }
});
