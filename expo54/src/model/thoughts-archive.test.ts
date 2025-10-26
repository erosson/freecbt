import { v4 as uuidv4 } from "uuid";
import { Archive, DistortionData, Thought } from ".";

export const A = Archive.createParsers(DistortionData);

const fixture: Thought.Json = {
  uuid: uuidv4(),
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  automaticThought: "auto",
  cognitiveDistortions: ["all-or-nothing"],
  challenge: "chal",
  alternativeThought: "alt",
};

test("parse empty json snapshot from old version", () => {
  // copied from expo47/archive.test.ts
  const snapshot =
    ":FreeCBT:N4IgbiBcIIIE4GMAWBLMBTAtGAjCANCAC5ID2ArgOZJEDOUA2gLoC+QA:FreeCBT:";
  expect(A.fromString.decode(snapshot)).toEqual(Archive.create([]));
});

test("create and parse", () => {
  const json: Archive.Json = { v: "Archive-v1", thoughts: [fixture] };
  const arc: Archive.Archive = A.fromJson.decode(json);
  expect(arc.thoughts).toHaveLength(1);
  const enc: string = A.fromString.encode(arc);
  expect(A.fromString.decode(enc)).toEqual(arc);
});

test("enforce valid distortions", () => {
  const json: Archive.Json = {
    v: "Archive-v1",
    thoughts: [{ ...fixture, cognitiveDistortions: ["nonsense"] }],
  };
  expect(() => A.fromJson.decode(json)).toThrow("no such Distortion.Slug");
});
