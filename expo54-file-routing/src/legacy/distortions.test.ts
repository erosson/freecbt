import * as D from "./io-ts/distortion"
import { decodeOrThrow } from "./io-ts/io-utils"

test("sorted", () => {
  expect(D.sortedList().map((d) => d.slug)).toEqual([
    "all-or-nothing",
    "catastrophizing",
    "emotional-reasoning",
    "fortune-telling",
    "labeling",
    "magnification-of-the-negative",
    "mind-reading",
    "minimization-of-the-positive",
    "other-blaming",
    "overgeneralization",
    "self-blaming",
    "should-statements",
  ])
  expect(D.legacyDistortions().map((d) => d.slug)).toEqual(
    D.sortedList().map((d) => d.slug)
  )
})

test("encode and decode", () => {
  const d: D.Distortion = D.bySlug["all-or-nothing"]
  expect(d).toBeTruthy()
  expect(d.slug).toBe("all-or-nothing")
  const enc: string = D.Codec.encode(d)
  const d2: D.Distortion = decodeOrThrow(D.Codec, enc)
  expect(typeof enc).toBe("string")
  expect(d2).toBe(d)
})

test("legacy encode and decode", () => {
  const d: D.Distortion = D.bySlug["all-or-nothing"]
  expect(d).toBeTruthy()
  expect(d.slug).toBe("all-or-nothing")
  const enc: D.Legacy = D.FromLegacy.encode(d)
  const d2: D.Distortion = decodeOrThrow(D.Codec, enc as any)
  expect(typeof enc).toBe("object")
  expect(d2).toBe(d)
})

test("legacy decode", () => {
  const enc: D.Legacy = {
    slug: "all-or-nothing",
    emoji: "💩",
    label: "whatever",
    description: "blah",
  }
  const d2: D.Distortion = decodeOrThrow(D.Codec, enc)
  expect(d2).toBe(D.bySlug["all-or-nothing"])
})

test("decode failure", () => {
  expect(() => decodeOrThrow(D.Codec, 3)).toThrow()
  expect(() => decodeOrThrow(D.Codec, null)).toThrow()
  expect(() => decodeOrThrow(D.Codec, "LOL")).toThrow()
  const enc: D.Legacy = {
    slug: "LOL-or-nothing",
    emoji: "💩",
    label: "whatever",
    description: "blah",
  }
  expect(() => decodeOrThrow(D.Codec, enc)).toThrow()
})
