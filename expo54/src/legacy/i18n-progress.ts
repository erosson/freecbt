/**
 * How complete is each of our translations?
 */
import en from "./locals/en.json"
import i18n from "./i18n"
import _ from "lodash"

export type Translation = { [k: string]: Translation | string }
export type Key = readonly string[]
export interface LangProgress {
  readonly name: string
  /** keys found in both this translation and the english translation */
  readonly found: readonly Key[]
  /** keys found in the english file, but not this file: incomplete translations */
  readonly notFound: readonly Key[]
  /** keys found in this file, but not the english file: unused/obsolete translations */
  readonly unused: readonly Key[]
  readonly percent: number
}
export interface TotalProgress {
  readonly complete: readonly string[]
  readonly incomplete: readonly {
    readonly name: string
    readonly percent: number
  }[]
  readonly langs: readonly LangProgress[]
}

// true for valid non-ignored keys
function filterKeys(k: Key): boolean {
  const s = k.join(".")
  return !s.startsWith("settings.locale.list")
}
export function langKeys(lang: string | Translation): readonly Key[] {
  return typeof lang === "string"
    ? [[]]
    : Object.entries(lang).flatMap(([k, v]) =>
        langKeys(v).map((tail) => [k, ...tail])
      )
}
export function langProgress(
  name: string,
  lang: Translation,
  opts: { base?: Translation; filter?: typeof filterKeys } = {}
): LangProgress {
  const base = opts.base ?? en
  const filter = opts.filter ?? filterKeys
  const ks = langKeys(base).filter(filter)
  const [found, notFound] = _.partition(ks, (k) => _.has(lang, k))
  const unused = langKeys(lang).filter((k) => !_.has(base, k))
  const percent = found.length / (found.length + notFound.length)
  return { name, found, notFound, unused, percent }
}
export function totalProgress(): TotalProgress {
  const langs = Object.entries(i18n.translations).map(([k, v]) =>
    langProgress(k, v)
  )
  const [complete, incomplete] = _.partition(
    langs,
    (lang) => lang.percent === 1
  ).map((cs) => cs.map(({ name, percent }) => ({ name, percent })))
  return {
    complete: complete.map((c) => c.name),
    incomplete: _.sortBy(incomplete, (c) => c.percent).reverse(),
    langs,
  }
}
