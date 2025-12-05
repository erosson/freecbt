import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Model } from ".";
import { AssertExtends } from "../type-utils";
import * as Distortion from "./distortion";

export const VERSION = "Thought-v2";

export const Json = z.object({
  automaticThought: z.string(),
  cognitiveDistortions: z.string().array(),
  challenge: z.string(),
  alternativeThought: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  uuid: z.string(),
  v: z.string().optional(),
});
export type Json = z.infer<typeof Json>;

export const LegacyJson = z.object({
  ...Json.shape,
  cognitiveDistortions: z.object({ slug: z.string() }).array(),
});
export type LegacyJson = z.infer<typeof LegacyJson>;

export const KEY_PREFIX = `@Quirk:thoughts:`;
// Keys start with KEY_PREFIX above, and are persisted as storage-ids (`storage.getItem(key)`).
export const Key = z.string().startsWith(KEY_PREFIX).brand<"thought.key">();
export type Key = z.infer<typeof Key>;
// Ids do NOT start with KEY_PREFIX above, and are persisted as `thought.uuid`.
// (I messed this up for a few versions, and some existing `thought.uuid`s will start with KEY_PREFIX, so we must be forgiving when parsing.)
export const Id = z
  .string()
  .refine((s) => !s.startsWith(KEY_PREFIX), {
    error: "starts with ID_PREFIX: looks like a key, not an id",
  })
  .brand<"thought.id">();
export type Id = z.infer<typeof Id>;
export const keyFromId = z.codec(Id, Key, {
  decode: (id: Id) => Key.decode(`${KEY_PREFIX}${id}`),
  encode: (key: z.input<typeof Key>) =>
    Id.decode(key.substring(KEY_PREFIX.length)),
});
export const idFromKey = z.codec(Key, Id, {
  decode: (key: Key) => keyFromId.encode(key),
  encode: (id: z.input<typeof Id>) => keyFromId.decode(id),
});

export const Spec = z.object({
  automaticThought: z.string(),
  cognitiveDistortions: z.set(Distortion.Distortion),
  challenge: z.string(),
  alternativeThought: z.string(),
});
export type Spec = z.infer<typeof Spec>;

export const Thought = z.object({
  ...Spec.shape,
  createdAt: z.date(),
  updatedAt: z.date(),
  // I messed this one up for a few versions...!
  // Parse both keys and ids in this field, but once parsed, it's always an id (unprefixed).
  uuid: z.union([Id, idFromKey]),
});
export type Thought = z.infer<typeof Thought>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _uuidIsIdType = AssertExtends<Thought["uuid"], Id>;
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type uuidIsNotKeyType = AssertExtends<Thought["uuid"], Key>;

export function isKey(key: string): boolean {
  return Key.safeDecode(key).success;
}

export function create(spec: Spec, now: Date): Thought {
  const createdAt = now;
  const updatedAt = now;
  const uuid = Id.decode(uuidv4());
  return { ...spec, createdAt, updatedAt, uuid };
}
export function toSpec(t: Thought): Spec {
  return _.pick(t, [
    "automaticThought",
    "cognitiveDistortions",
    "challenge",
    "alternativeThought",
  ]);
}

export function emptySpec(): Spec {
  return {
    automaticThought: "",
    cognitiveDistortions: new Set(),
    challenge: "",
    alternativeThought: "",
  };
}

/**
 * Thought-parsing enforces valid distortions, but parameterize the distortion-data until later.
 */
export function createParsers(data: Distortion.Data) {
  const { fromSlugSet: distortionsFromSlugSet } =
    Distortion.createParsers(data);

  const toJson = z.codec(Json, Thought, {
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
      return Json.decode({
        ...t,
        cognitiveDistortions,
        createdAt,
        updatedAt,
        v: VERSION,
      });
    },
  });
  const fromJson = z.codec(z.union([Json, LegacyJson]), toJson, {
    decode: (json: Json | LegacyJson) => {
      const cognitiveDistortions = json.cognitiveDistortions.map((d) =>
        typeof d === "string" ? d : d.slug
      );
      return { ...json, cognitiveDistortions };
    },
    encode: (json: Json) => json,
  });

  const fromString = z.codec(z.string(), fromJson, {
    decode: (enc: string) => JSON.parse(enc),
    encode: (dec: Json | LegacyJson) => JSON.stringify(dec),
  });
  return { fromJson, toJson, fromString };
}

export function label(t: Thought, m: Pick<Model.Ready, "settings">) {
  return m.settings.historyLabels === "automatic-thought"
    ? t.automaticThought
    : t.alternativeThought;
}
export function distortionsList(t: Thought): readonly Distortion.Distortion[] {
  return _.sortBy(Array.from(t.cognitiveDistortions), (d) => d.slug);
}
export function emojis(t: Thought): string {
  return distortionsList(t).map(Distortion.emoji).join("");
}
export function key(t: Thought): Key {
  return keyFromId.decode(t.uuid);
}
