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
  v: Thought.VERSION,
};

test("parse valid json", () => {
  const t = T.fromJson.decode(fixture);
  expect(t).toBeTruthy();
  expect(t.uuid.startsWith(Thought.KEY_PREFIX)).toBe(false);
  expect(t.cognitiveDistortions.size).toBe(1);
  expect(Array.from(t.cognitiveDistortions).map((d) => d.slug)).toEqual([
    "all-or-nothing",
  ]);
});

test("allow missing version", () => {
  const { v, ...json } = fixture;
  const t = T.fromJson.decode(json);
  expect(t).toBeTruthy();
});

test("allow legacy distortion objects", () => {
  const json = {
    ...fixture,
    cognitiveDistortions: [{ slug: "all-or-nothing", stuff: "nonsense" }],
  };
  const t = T.fromJson.decode(json);
  expect(t).toBeTruthy();
});

test("accept keys saved in the id field, too", () => {
  // I messed this one up for a few versions...!
  // be forgiving when parsing it...
  const json = { ...fixture, uuid: `${Thought.KEY_PREFIX}${fixture.uuid}` };
  const t = T.fromJson.decode(json);
  // ...but consistent after it's parsed
  expect(t).toBeTruthy();
  expect(t.uuid).toBe(fixture.uuid);
  expect(t.uuid.startsWith(Thought.KEY_PREFIX)).toBe(false);
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

test("parse and encode with situation, emotions, and blockTimestamps", () => {
  const fixtureWithEmotions: Thought.Json = {
    ...fixture,
    situation: "Meeting presentation",
    emotions: [
      { name: "Anxiety", intensity: 80, reassessedIntensity: 35 },
      { name: "Dread", intensity: 60, reassessedIntensity: 20 },
    ],
    blockTimestamps: {
      situation: "2026-10-14T06:00:00.000Z",
      automaticThought: "2026-10-14T06:01:00.000Z",
      distortions: "2026-10-14T06:02:00.000Z",
      challenge: "2026-10-14T06:03:00.000Z",
      alternativeThought: "2026-10-14T06:04:00.000Z",
    },
  };
  const t = T.fromJson.decode(fixtureWithEmotions);
  expect(t.situation).toBe("Meeting presentation");
  expect(t.emotions?.length).toBe(2);
  expect(t.emotions?.[0].intensity).toBe(80);
  expect(t.emotions?.[0].reassessedIntensity).toBe(35);
  expect(Thought.getBlockTimestamp(t, "situation").toISOString()).toBe(
    "2026-10-14T06:00:00.000Z"
  );
  const encoded = T.fromJson.encode(t);
  expect(encoded).toEqual(fixtureWithEmotions);
});

test("calculateEmotionDelta", () => {
  expect(Thought.calculateEmotionDelta(80, 35)).toEqual({
    diff: -45,
    direction: "decrease",
  });
  expect(Thought.calculateEmotionDelta(30, 55)).toEqual({
    diff: 25,
    direction: "increase",
  });
  expect(Thought.calculateEmotionDelta(50, 50)).toEqual({
    diff: 0,
    direction: "same",
  });
  expect(Thought.calculateEmotionDelta(50, undefined)).toEqual({
    diff: 0,
    direction: "none",
  });
});

test("getEmotionSuggestions", () => {
  const thoughts: Thought.Thought[] = [
    {
      ...Thought.create(
        {
          automaticThought: "a",
          cognitiveDistortions: new Set(),
          challenge: "c",
          alternativeThought: "alt",
          emotions: [{ name: "Anxiety", intensity: 80 }],
        },
        new Date()
      ),
    },
    {
      ...Thought.create(
        {
          automaticThought: "b",
          cognitiveDistortions: new Set(),
          challenge: "c",
          alternativeThought: "alt",
          emotions: [{ name: "Anger", intensity: 50 }],
        },
        new Date()
      ),
    },
  ];

  expect(
    Thought.getEmotionSuggestions(thoughts, ["Sadness"], "an", ["Anxiety"])
  ).toEqual(["Anger"]);
  expect(
    Thought.getEmotionSuggestions(thoughts, ["Sadness"], "", [])
  ).toEqual(["Anger", "Anxiety", "Sadness"]);
});
