import { Distortion, DistortionData } from ".";

export const D = Distortion.createParsers(DistortionData);

test("parse valid slug", () => {
  expect(D.validSlug.parse("all-or-nothing")).toBeTruthy();
});
test("parse missing slug", () => {
  expect(() => D.validSlug.parse("nonsense")).toThrow(
    "no such Distortion.Slug"
  );
});
test("parse bad slug types", () => {
  expect(() => D.validSlug.parse(null)).toThrow();
  expect(() => D.validSlug.parse(3)).toThrow();
  // if you want compile-time errors, use decode() instead of parse()
  // expect(() => DistortionData.validSlug.decode(3)).toThrow();
});
test("parse valid distortion", () => {
  expect(D.fromSlug.parse("all-or-nothing")).toBeTruthy();
  expect(D.fromSlug.parse("all-or-nothing")).toEqual(
    DistortionData.bySlug.get("all-or-nothing")
  );
});
test("parse invalid distortions", () => {
  expect(() => D.fromSlug.parse("nonsense")).toThrow("no such Distortion.Slug");
  expect(() => D.fromSlug.parse(null)).toThrow();
  expect(() => D.fromSlug.parse(3)).toThrow();
});

test("parse valid distortion-list", () => {
  expect(D.fromSlugList.decode(["all-or-nothing"])).toHaveLength(1);
  expect(D.fromSlugList.decode(["all-or-nothing"])).toEqual([
    DistortionData.bySlug.get("all-or-nothing"),
  ]);

  expect(
    D.fromSlugList.decode(["all-or-nothing", "overgeneralization"])
  ).toHaveLength(2);
  expect(
    D.fromSlugList.decode(["all-or-nothing", "overgeneralization"])
  ).toEqual([
    DistortionData.bySlug.get("all-or-nothing"),
    DistortionData.bySlug.get("overgeneralization"),
  ]);

  expect(D.fromSlugList.decode([])).toHaveLength(0);
  expect(D.fromSlugList.decode([])).toEqual([]);
});

test("parse invalid distortions", () => {
  expect(() => D.fromSlugList.decode(["nonsense"])).toThrow(
    "no such Distortion.Slug"
  );
  expect(() => D.fromSlugList.decode(["all-or-nothing", "nonsense"])).toThrow(
    "no such Distortion.Slug"
  );
  expect(() => D.fromSlugList.parse("all-or-nothing")).toThrow();
  expect(() => D.fromSlugList.parse(null)).toThrow();
  expect(() => D.fromSlugList.parse(3)).toThrow();
});

test("parse valid distortion-set", () => {
  expect(D.fromSlugSet.decode(new Set(["all-or-nothing"]))).toEqual(
    new Set([DistortionData.bySlug.get("all-or-nothing")])
  );

  expect(
    D.fromSlugSet.decode(new Set(["all-or-nothing", "overgeneralization"]))
  ).toEqual(
    new Set([
      DistortionData.bySlug.get("all-or-nothing"),
      DistortionData.bySlug.get("overgeneralization"),
    ])
  );

  expect(D.fromSlugSet.decode(new Set([]))).toEqual(new Set([]));
});

test("parse invalid distortion-set", () => {
  expect(() => D.fromSlugSet.decode(new Set(["nonsense"]))).toThrow(
    "no such Distortion.Slug"
  );
  expect(() =>
    D.fromSlugSet.decode(new Set(["all-or-nothing", "nonsense"]))
  ).toThrow("no such Distortion.Slug");
  expect(() => D.fromSlugSet.parse(["all-or-nothing"])).toThrow();
  expect(() => D.fromSlugSet.parse("all-or-nothing")).toThrow();
  expect(() => D.fromSlugSet.parse(null)).toThrow();
  expect(() => D.fromSlugSet.parse(3)).toThrow();
});
