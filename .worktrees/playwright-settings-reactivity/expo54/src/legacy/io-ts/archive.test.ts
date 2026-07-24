import * as A from "./archive"
import * as E from "fp-ts/Either"
import * as T from "./thought"

const testdata: { name: string; dec: A.Archive }[] = [
  {
    name: "empty",
    dec: A.create([]),
  },
  {
    name: "nonempty",
    dec: A.create(
      [
        {
          automaticThought: "auto",
          challenge: "chal",
          alternativeThought: "alt",
          cognitiveDistortions: ["all-or-nothing"],
          createdAt: new Date(1234),
          updatedAt: new Date(1234),
          uuid: "someuuid",
        },
      ].map((args) => T.Codec.encode(T.create(args)))
    ),
  },
  {
    name: "multiple",
    dec: A.create(
      [
        {
          automaticThought: "auto",
          challenge: "chal",
          alternativeThought: "alt",
          cognitiveDistortions: ["all-or-nothing"],
          createdAt: new Date(1234),
          updatedAt: new Date(1234),
          uuid: "someuuid",
        },
        {
          automaticThought: "auto2",
          challenge: "chal2",
          alternativeThought: "alt2",
          cognitiveDistortions: ["all-or-nothing", "should-statements"],
          createdAt: new Date(4321),
          updatedAt: new Date(4321),
          uuid: "someuuid2",
        },
      ].map((args) => T.Codec.encode(T.create(args)))
    ),
  },
]

test.each(testdata)("encode/decode archives: $name", ({ dec }) => {
  const enc: string = A.Codec.encode(dec)
  expect(enc).toMatch(/^:FreeCBT:/)
  expect(enc).toMatchSnapshot()
  expect(A.Codec.encode(dec)).toEqual(enc)
  expect(A.Codec.decode(enc)).toEqual(E.right(dec))
  expect(A.Codec.decode("!" + enc)).toEqual(E.left(expect.anything()))
})
