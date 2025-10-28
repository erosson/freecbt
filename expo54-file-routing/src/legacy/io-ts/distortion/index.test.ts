import * as D from "./index"
import * as E from "fp-ts/Either"

test("from id", () => {
  expect(D.Codec.decode("all-or-nothing")).toMatchObject({
    right: { slug: "all-or-nothing" },
  })
  expect(D.Codec.decode("bogus")).toMatchObject({
    left: expect.anything(),
  })
})

test("Codec decodes legacy and id", () => {
  expect(D.Codec.decode("all-or-nothing")).toMatchObject({
    right: { slug: "all-or-nothing" },
  })
  expect(D.Codec.decode("bogus")).toMatchObject({
    left: expect.anything(),
  })
  const legacy = D.legacyDistortions()[0]
  expect(D.Codec.decode(legacy)).toMatchObject({
    right: { slug: "all-or-nothing" },
  })
  expect(D.Codec.decode({ ...legacy, slug: "bogus" })).toMatchObject({
    left: expect.anything(),
  })
  // I'm not 100% sure of the old format, so allow decoding just the legacy slug + selected
  expect(D.Codec.decode({ slug: "all-or-nothing" })).toMatchObject({
    right: { slug: "all-or-nothing" },
  })
  expect(
    D.Codec.decode({ slug: "all-or-nothing", selected: true })
  ).toMatchObject({
    right: { slug: "all-or-nothing" },
  })
  // selected filtering isn't done here, yet
  expect(
    D.Codec.decode({ slug: "all-or-nothing", selected: false })
  ).toMatchObject({
    right: { slug: "all-or-nothing" },
  })

  expect(D.Codec.encode(D.list[0])).toEqual(D.list[0].slug)

  // We'll always encode Distortions as ids, and the codec's type agrees
  const _: string = D.Codec.encode(D.list[0])
  // @ts-expect-error
  const __: D.Legacy = D.Codec.encode(D.list[0])
})

test("Codec-set filters selected", () => {
  expect(
    D.SetCodec.decode([{ slug: "all-or-nothing", selected: false }])
  ).toEqual(E.right(new Set()))
  expect(D.SetCodec.decode([{ slug: "all-or-nothing" }])).toEqual(
    E.right(new Set())
  )
  expect(
    D.SetCodec.decode([{ slug: "all-or-nothing", selected: true }])
  ).toEqual(E.right(new Set([D.bySlug["all-or-nothing"]])))
  expect(D.SetCodec.decode(["all-or-nothing"])).toEqual(
    E.right(new Set([D.bySlug["all-or-nothing"]]))
  )
})
