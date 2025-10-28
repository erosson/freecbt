import en from "./locals/en.json"
import _ from "lodash"
import {
  Translation,
  langKeys,
  langProgress,
  totalProgress,
} from "./i18n-progress"
// import fs from "fs/promises"

const example: Translation = { a: "a", b: { c: "bc", d: { e: "bde" } } }
test("localization keys", () => {
  expect(langKeys(example)).toEqual([["a"], ["b", "c"], ["b", "d", "e"]])
  expect(langKeys(en)).toEqual(langKeys(en))
})

test("localization progress", () => {
  const base = { b: example.b, f: "f" }
  expect(langProgress("ex", example, { base })).toEqual({
    name: "ex",
    found: [
      ["b", "c"],
      ["b", "d", "e"],
    ],
    notFound: [["f"]],
    unused: [["a"]],
    percent: 2 / 3,
  })
  expect(langProgress("en", en)).toEqual(langProgress("en", en))
})

test("total localization", () => {
  const t = totalProgress()
  expect(t.complete).toContain("en")
  // fs.writeFile(
  // __dirname + "/../../../www/public/i18n-progress.json",
  // JSON.stringify(t, null, 2)
  // )
})
