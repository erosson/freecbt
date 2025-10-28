import i18n from "i18n-js";

import de from "../../../expo54/src/locals/de.json";
import en from "../../../expo54/src/locals/en.json";
import es from "../../../expo54/src/locals/es.json";
import fi from "../../../expo54/src/locals/fi.json";
import fr from "../../../expo54/src/locals/fr.json";
import it from "../../../expo54/src/locals/it.json";
import ko from "../../../expo54/src/locals/ko.json";
import nb from "../../../expo54/src/locals/nb.json";
import nl from "../../../expo54/src/locals/nl_NL.json";
import pl from "../../../expo54/src/locals/pl.json";
import ptBR from "../../../expo54/src/locals/pt-br.json";
import ptPT from "../../../expo54/src/locals/pt-pt.json";
import ro from "../../../expo54/src/locals/ro.json";
import ru from "../../../expo54/src/locals/ru.json";
import sv from "../../../expo54/src/locals/sv.json";
import zhHans from "../../../expo54/src/locals/zh-Hans.json";

function walkReverse(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key,
      typeof val === "string"
        ? val.split("").reverse().join("")
        : walkReverse(val),
    ])
  );
}
i18n.translations = {
  fr,
  en,
  it,
  ko,
  pl,
  es,
  de,
  fi,
  nl,
  ru,
  "zh-Hans": zhHans,
  "pt-PT": ptPT,
  "pt-BR": ptBR,
  nb,
  sv,
  ro,
  // testing with an obviously-transformed language makes it easy to find and
  // remove hardcoded strings. Hidden behind `feature.testLocalesVisible`.
  _test: walkReverse(en),
}
i18n.defaultLocale = "en"
i18n.fallbacks = true
export default { translations: Object.keys(i18n.translations) }
