import * as T from "./io-ts/thought"
import * as D from "./io-ts/distortion"
import * as _ from "lodash"
import { decodeOrThrow } from "./io-ts/io-utils"

function empty(): T.Thought {
  return T.create({
    automaticThought: "",
    alternativeThought: "",
    challenge: "",
    cognitiveDistortions: [],
  })
}
function newSavedThought(date: string): T.Thought {
  return {
    ...empty(),
    createdAt: new Date(date),
    updatedAt: new Date(date),
    uuid: "foo",
  }
}

test("groupByDay when given an empty array, returns an empty array", () => {
  const groups = T.groupByDay([])
  expect(groups.length).toBe(0)
})

test("groupByDay returns at least one thought", () => {
  const groups = T.groupByDay([newSavedThought("Dec 24, 2018")])
  expect(groups.length).toBe(1)
})

test("groupByDay puts different days thoughts in different places", () => {
  const mondayThought = newSavedThought("Dec 24, 2018")
  const tuesdayThought = newSavedThought("Dec 25, 2018") // 🎄 is a tuesday this year

  const groups = T.groupByDay([mondayThought, tuesdayThought])

  expect(groups.length).toBe(2)
  expect(groups[1].thoughts[0]).toBe(mondayThought)
  expect(groups[0].thoughts[0]).toBe(tuesdayThought)
})

test("groupByDay puts multiple thoughts in one day", () => {
  const groups = T.groupByDay([
    // Christmas ones
    newSavedThought("Dec 25, 2018"),
    newSavedThought("Dec 25, 2018"),
    newSavedThought("Dec 25, 2018"),

    // New Years
    newSavedThought("Jan 1, 2019"),
  ])

  expect(groups.length).toBe(2)

  // Christmas
  expect(groups[1].date).toEqual(new Date("Dec 25, 2018").toDateString())
  expect(groups[1].thoughts.length).toBe(3)

  // New Years
  expect(groups[0].date).toEqual(new Date("Jan 1, 2019").toDateString())
  expect(groups[0].thoughts.length).toBe(1)
})

test("groupByDay doesn't copy thoughts", () => {
  const firstThought = newSavedThought("Dec 24, 2018")
  firstThought.automaticThought = "first"

  const secondThought = newSavedThought("Dec 24, 2018")
  secondThought.automaticThought = "second"

  const groups = T.groupByDay([firstThought, secondThought])
  expect(groups.length).toBe(1)
  expect(groups[0].thoughts).toEqual([firstThought, secondThought])
  expect(groups[0].date).toBe(new Date("Dec 24, 2018").toDateString())
})

test("groupByDay displays the groups in order", () => {
  const groups = T.groupByDay([
    // New Years
    newSavedThought("Jan 1, 2019"),

    // Christmas ones
    newSavedThought("Dec 25, 2018"),
    newSavedThought("Dec 25, 2018"),
    newSavedThought("Dec 25, 2018"),
  ])

  expect(groups[0].date).toBe(new Date("Jan 1, 2019").toDateString())
  expect(groups[1].date).toBe(new Date("Dec 25, 2018").toDateString())
})

test("groupByDay displays the thoughts in order", () => {
  const first = new Date("Dec 25, 2018")
  first.setTime(0)
  const second = new Date("Dec 25, 2018")
  second.setTime(100)
  const third = new Date("Dec 25, 2018")
  third.setTime(200)

  const unordered = [
    newSavedThought(first.toDateString()),
    newSavedThought(third.toDateString()),
    newSavedThought(second.toDateString()),
  ]

  // Ordered most recent first
  const ordered = [
    newSavedThought(third.toDateString()),
    newSavedThought(second.toDateString()),
    newSavedThought(first.toDateString()),
  ]

  const groups = T.groupByDay(unordered)
  expect(groups[0].thoughts).toEqual(ordered)
})

test("encode and decode: empty", () => {
  const t: T.Thought = empty()
  const enc = T.Thought.encode(t)
  const t2: T.Thought = decodeOrThrow(T.Thought, enc)
  expect({ ...t2, createdAt: t.createdAt, updatedAt: t.updatedAt }).toEqual(t)
  expect(t2.createdAt.getTime()).toBe(t.createdAt.getTime())
  expect(t2.updatedAt.getTime()).toBe(t.updatedAt.getTime())
  expect(t2).not.toEqual(enc)
})

test("encode and decode: nonempty", () => {
  const t: T.Thought = T.create({
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "challenge",
    cognitiveDistortions: [D.bySlug["all-or-nothing"]],
  })
  const enc: any = T.Codec.encode(t)
  const t2: T.Thought = decodeOrThrow(T.Codec, enc)
  expect({ ...t2, createdAt: t.createdAt, updatedAt: t.updatedAt }).toEqual(t)
  expect(t2.createdAt.getTime()).toBe(t.createdAt.getTime())
  expect(t2.updatedAt.getTime()).toBe(t.updatedAt.getTime())
  expect(t2).not.toEqual(enc)
  expect(typeof enc["cognitiveDistortions"][0]).toBe("string")
})

test("legacy encode and decode", () => {
  const t: T.Thought = T.create({
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "challenge",
    cognitiveDistortions: [D.bySlug["all-or-nothing"]],
  })
  const enc = T.FromLegacy.encode(t)
  const t2: T.Thought = decodeOrThrow(T.Codec, enc)
  expect(typeof enc).toBe("object")
  expect({ ...t2, createdAt: t.createdAt, updatedAt: t.updatedAt }).toEqual(t)
  expect(t2.createdAt.getTime()).toBe(t.createdAt.getTime())
  expect(t2.updatedAt.getTime()).toBe(t.updatedAt.getTime())
  expect(t2).toEqual(t)
})

test("non-legacy decode", () => {
  const enc: T.Persist = {
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "challenge",
    uuid: "what",
    createdAt: "1977-01-01T00:00:00.000Z",
    updatedAt: "1977-01-01T00:00:00.000Z",
    cognitiveDistortions: ["all-or-nothing"],
    v: T.VERSION,
  }
  const t2: T.Thought = decodeOrThrow(T.Codec, enc)
  expect(t2).toBeTruthy()
  expect(Array.from(t2.cognitiveDistortions)).toHaveLength(1)
  expect(Array.from(t2.cognitiveDistortions)[0]).toBe(
    D.bySlug["all-or-nothing"]
  )
})

test("legacy decode", () => {
  const enc: T.Legacy = {
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "challenge",
    uuid: "what",
    createdAt: "1977-01-01T00:00:00.000Z",
    updatedAt: "1977-01-01T00:00:00.000Z",
    cognitiveDistortions: [
      {
        slug: "all-or-nothing",
        emoji: "💩",
        label: "whatever",
        description: "blah",
        selected: true,
      } as D.Legacy,
      {
        slug: "mind-reading",
        emoji: "💩",
        label: "whatever",
        description: "blah",
      },
      {
        slug: "should-statements",
        emoji: "💩",
        label: "whatever",
        description: "blah",
        selected: false,
      } as D.LegacyID,
    ],
  }
  const t2: T.Thought = decodeOrThrow(T.Codec, enc)
  expect(t2).toBeTruthy()
  expect(Array.from(t2.cognitiveDistortions)).toHaveLength(1)
  expect(Array.from(t2.cognitiveDistortions)[0]).toBe(
    D.bySlug["all-or-nothing"]
  )
})

test("decode failure", () => {
  expect(() => decodeOrThrow(T.Codec, 3)).toThrow()
  expect(() => decodeOrThrow(T.Codec, null)).toThrow()
  expect(() => decodeOrThrow(T.Codec, "LOL")).toThrow()

  const t: T.Thought = T.create({
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "challenge",
    cognitiveDistortions: [D.bySlug["all-or-nothing"]],
  })
  const enc: any = T.Codec.encode(t)
  const encD: D.Legacy = {
    slug: "all-or-nothing",
    emoji: "💩",
    label: "whatever",
    description: "blah",
  }
  expect(decodeOrThrow(T.Codec, enc)).toBeTruthy()
  expect(() => decodeOrThrow(T.Codec, { ...enc, uuid: 3 })).toThrow()
  expect(() =>
    decodeOrThrow(T.Codec, { ...enc, automaticThought: 3 })
  ).toThrow()
  expect(() => decodeOrThrow(T.Codec, { ...enc, createdAt: "no" })).toThrow()
  expect(() => decodeOrThrow(T.Codec, _.omit(enc, "uuid"))).toThrow()
  expect(() =>
    decodeOrThrow(T.Codec, _.omit(enc, "automaticThought"))
  ).toThrow()
  expect(() => decodeOrThrow(T.Codec, _.omit(enc, "createdAt"))).toThrow()
})

test("create from distortion-slugs", () => {
  const t: T.Thought = T.create({
    alternativeThought: "",
    automaticThought: "",
    challenge: "",
    cognitiveDistortions: ["all-or-nothing"],
  })
  expect(t).toBeTruthy()
  expect(Array.from(t.cognitiveDistortions)[0]).toBe(D.bySlug["all-or-nothing"])
})
