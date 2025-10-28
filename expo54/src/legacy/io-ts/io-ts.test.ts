import * as T from "io-ts"
import * as TT from "io-ts-types"
import * as E from "fp-ts/lib/Either"
import { PathReporter as Reporter } from "io-ts/lib/PathReporter"
import { pipe } from "fp-ts/lib/function"

function instance<A, O = A, I = unknown>(
  cls: new (input: I) => A,
  encode: (t: A) => O
): T.Type<A, O, I> {
  return new T.Type<A, O, I>(
    cls.name,
    (value): value is A => value instanceof cls,
    (input, c) => T.success(new cls(input)),
    encode
  )
}

test("encode", () => {
  // encode/decode work as expected
  expect(TT.DateFromNumber.decode(12345)).toEqual(E.right(new Date(12345)))
  expect(TT.DateFromNumber.decode("12345")).toMatchObject({ _tag: "Left" })
  expect(TT.DateFromNumber.encode(new Date(12345))).toEqual(12345)
  // mapOutput doesn't achieve what I thought it would. not bidirectional...
  expect(
    TT.mapOutput(TT.DateFromNumber, (d) => "" + d).encode(new Date(12345))
  ).toEqual("12345")
  expect(TT.mapOutput(TT.DateFromNumber, (d) => "" + d).decode(12345)).toEqual(
    E.right(new Date(12345))
  )
  // pipe links two codecs together!
  expect(
    TT.NumberFromString.pipe(TT.DateFromNumber).encode(new Date(12345))
  ).toEqual("12345")
  expect(TT.NumberFromString.pipe(TT.DateFromNumber).decode("12345")).toEqual(
    E.right(new Date(12345))
  )
  expect(
    Reporter.report(
      TT.NumberFromString.pipe(TT.DateFromNumber, "testpipe").decode(12345)
    )
  ).toEqual(["Invalid value 12345 supplied to : testpipe"])
  if (false)
    // @ts-expect-error: wrong pipe order is a typecheck fail
    expect(TT.DateFromNumber.pipe(TT.NumberFromString).decode("12345")).toEqual(
      E.right(new Date(12345))
    )

  // trying out pipe
  expect(
    pipe(
      1,
      E.right,
      E.map((n) => n + 1)
    )
  ).toEqual(E.right(2))
  // trying out a class codec
  class C {
    constructor(public val: number) {}
  }
  // based on https://github.com/gcanti/io-ts-types/blob/master/src/DateFromNumber.ts
  const CFromNumber = new T.Type<C, number>(
    "CFromNumber",
    (value): value is C => value instanceof C,
    (input, c) =>
      pipe(
        T.number.validate(input, c),
        E.map((n) => new C(n))
      ),
    (output) => output.val
  )
  expect(CFromNumber.decode(3)).toEqual(E.right(new C(3)))
  expect(Reporter.report(CFromNumber.decode("3"))).toEqual([
    'Invalid value "3" supplied to : CFromNumber',
  ])
  expect(CFromNumber.encode(new C(3))).toEqual(3)

  const CFromNumber2 = new T.Type<C, number, number>(
    "CFromNumber2",
    (value): value is C => value instanceof C,
    (input, c) => E.right(new C(input)),
    (output) => output.val
  )
  expect(CFromNumber2.decode(3)).toEqual(E.right(new C(3)))
  // @ts-expect-error: above requires a number as input, at the type level. also, we don't check for number!
  expect(CFromNumber2.decode("3")).toEqual(E.right(new C("3" as any)))
  expect(CFromNumber2.encode(new C(3))).toEqual(3)

  // but we can pipe it nicely
  const CFromNumber3 = T.number.pipe(CFromNumber2, "CFromNumber3")
  expect(CFromNumber3.decode(3)).toEqual(E.right(new C(3)))
  expect(Reporter.report(CFromNumber3.decode("3"))).toEqual([
    'Invalid value "3" supplied to : CFromNumber3',
  ])
  expect(CFromNumber3.encode(new C(3))).toEqual(3)
})
