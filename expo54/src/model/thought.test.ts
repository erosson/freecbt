import { v4 as uuidv4 } from "uuid";
import { DistortionData, Thought } from ".";

export const T = Thought.createParsers(DistortionData);

const fixture: Thought.Json = {
  uuid: uuidv4(),
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  automaticThought: "auto",
  cognitiveDistortions: ["all-or-nothing"],
  challenge: "chal",
  alternativeThought: "alt",
};

test("parse valid json", () => {
  const t = T.fromJson.decode(fixture);
  expect(t).toBeTruthy();
  expect(t.cognitiveDistortions.size).toBe(1);
  expect(Array.from(t.cognitiveDistortions).map((d) => d.slug)).toEqual([
    "all-or-nothing",
  ]);
});

test("enforce missing distortions", () => {
  expect(() =>
    T.fromJson.decode({ ...fixture, cognitiveDistortions: ["nonsense"] })
  ).toThrow("no such Distortion.Slug");
});

test("encode", () => {
  const t = T.fromJson.decode(fixture);
  const json = T.fromJson.encode(t);
  expect(json).toEqual(fixture);
});
