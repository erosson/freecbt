import * as Distortion from "../distortion"
import * as Thought from "./index"
import * as E from "fp-ts/lib/Either"
import { PathReporter } from "io-ts/lib/PathReporter"

test("thought from persist", () => {
  const thought: Thought.Thought = Thought.create({
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "chal",
    cognitiveDistortions: ["all-or-nothing"],
  })
  const persist: Thought.Persist = {
    ...thought,
    cognitiveDistortions: ["all-or-nothing"],
    createdAt: thought.createdAt.toISOString(),
    updatedAt: thought.updatedAt.toISOString(),
  }
  expect(Thought.Codec.encode(thought)).toEqual(persist)
  expect(Thought.Codec.decode(persist)).toEqual(E.right(thought))
  expect(Thought.Codec.decode(Thought.Codec.encode(thought))).toEqual(
    E.right(thought)
  )
  expect(
    Thought.Codec.decode({ ...persist, cognitiveDistortions: ["bogus"] })
  ).toEqual(E.left(expect.anything()))
  expect(Thought.Codec.decode({ ...persist, createdAt: "not a date" })).toEqual(
    E.left(expect.anything())
  )
  expect(Thought.Codec.decode({ ...persist, createdAt: 12345 })).toEqual(
    E.left(expect.anything())
  )
})

test("thought from legacy", () => {
  const thought: Thought.Thought = Thought.create({
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "chal",
    cognitiveDistortions: ["all-or-nothing"],
  })
  const legacy: Thought.Legacy = {
    uuid: thought.uuid,
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "chal",
    cognitiveDistortions: [
      Distortion.FromLegacy.encode(Distortion.bySlug["all-or-nothing"]),
      Distortion.FromLegacy.encode(Distortion.bySlug["mind-reading"]),
      Distortion.FromLegacy.encode(Distortion.bySlug["should-statements"]),
    ] as Distortion.Legacy[],
    createdAt: thought.createdAt.toISOString(),
    updatedAt: thought.updatedAt.toISOString(),
  }
  legacy.cognitiveDistortions[0].selected = true
  legacy.cognitiveDistortions[1].selected = false
  delete legacy.cognitiveDistortions[2].selected
  const minLegacy: Thought.Legacy = {
    ...legacy,
    cognitiveDistortions: [
      { slug: "all-or-nothing", selected: true },
      { slug: "mind-reading", selected: false },
      { slug: "should-statements" },
    ],
  }
  expect("v" in legacy).toBeFalsy()
  expect("v" in minLegacy).toBeFalsy()
  expect(Thought.Codec.decode(minLegacy)).toEqual(E.right(thought))
  expect(Thought.Codec.decode(legacy)).toEqual(E.right(thought))
  expect(Thought.Codec.decode({ ...minLegacy, v: undefined })).toEqual(
    E.right(thought)
  )
  expect(Thought.Codec.decode({ ...legacy, v: undefined })).toEqual(
    E.right(thought)
  )

  // we can transform modern thoughts to the legacy format - DebugScreen uses this
  expect(Thought.FromLegacy.encode(thought)).toEqual({
    ...legacy,
    cognitiveDistortions: [legacy.cognitiveDistortions[0]],
  })
  expect(Thought.FromLegacy.decode(minLegacy)).toEqual(E.right(thought))
  expect(Thought.FromLegacy.decode(legacy)).toEqual(E.right(thought))

  expect(Thought.FromLegacy.decode(minLegacy)).toEqual(
    Thought.Codec.decode(minLegacy)
  )
  expect(Thought.FromLegacy.decode(legacy)).toEqual(
    Thought.Codec.decode(legacy)
  )

  // The main codec always encodes Thoughts as Persist, the modern format -
  // despite knowing how to decode Legacy thoughts - and the types agree
  const _: Thought.Persist = Thought.Codec.encode(thought)
  // @ts-expect-error
  const __: Thought.Legacy = Thought.Codec.encode(thought)
})
