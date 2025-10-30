import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import * as Distortion from "./distortion";

export const Json = z.object({
  automaticThought: z.string(),
  cognitiveDistortions: z.string().array(),
  challenge: z.string(),
  alternativeThought: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  uuid: z.string(),
});
export type Json = z.infer<typeof Json>;

export const ID_PREFIX = `@Quirk:thoughts:`;
export const Thought = z.object({
  automaticThought: z.string(),
  cognitiveDistortions: z.set(Distortion.Distortion),
  challenge: z.string(),
  alternativeThought: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  uuid: z.string(),
});
export type Thought = z.infer<typeof Thought>;

export function isKey(key: string): boolean {
  return key.startsWith(ID_PREFIX);
}

export type Spec = Pick<
  Thought,
  | "automaticThought"
  | "cognitiveDistortions"
  | "challenge"
  | "alternativeThought"
>;
export function create(spec: Spec, now: Date): Thought {
  const createdAt = now;
  const updatedAt = now;
  const uuid = `${ID_PREFIX}${uuidv4()}`;
  return { ...spec, createdAt, updatedAt, uuid };
}

/**
 * Thought-parsing enforces valid distortions, but parameterize the distortion-data until later.
 */
export function createParsers(data: Distortion.Data) {
  const { fromSlugSet: distortionsFromSlugSet } =
    Distortion.createParsers(data);

  const fromJson = z.codec(Json, Thought, {
    decode: (json: Json) => {
      const cognitiveDistortions = distortionsFromSlugSet.decode(
        new Set(json.cognitiveDistortions)
      );
      const createdAt = new Date(json.createdAt);
      const updatedAt = new Date(json.updatedAt);
      return Thought.decode({
        ...json,
        cognitiveDistortions,
        createdAt,
        updatedAt,
      });
    },
    encode: (t: z.input<typeof Thought>) => {
      const cognitiveDistortions = Array.from(t.cognitiveDistortions).map(
        (d) => d.slug
      );
      const createdAt = t.createdAt.toISOString();
      const updatedAt = t.updatedAt.toISOString();
      return Json.decode({ ...t, cognitiveDistortions, createdAt, updatedAt });
    },
  });

  const fromString = z.codec(z.string(), fromJson, {
    decode: (enc: string) => JSON.parse(enc),
    encode: (dec: Json) => JSON.stringify(dec),
  });
  return { fromJson, fromString };
}
