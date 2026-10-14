import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Model } from ".";
import { AssertExtends } from "../type-utils";
import * as Distortion from "./distortion";

export const VERSION = "Thought-v2";

export const Emotion = z.object({
  name: z.string(),
  intensity: z.number().min(0).max(100),
  reassessedIntensity: z.number().min(0).max(100).optional(),
});
export type Emotion = z.infer<typeof Emotion>;

export const BlockTimestamps = z.object({
  situation: z.string().optional(),
  automaticThought: z.string().optional(),
  distortions: z.string().optional(),
  challenge: z.string().optional(),
  alternativeThought: z.string().optional(),
});
export type BlockTimestamps = z.infer<typeof BlockTimestamps>;

export const Json = z.object({
  situation: z.string().optional(),
  automaticThought: z.string(),
  cognitiveDistortions: z.string().array(),
  challenge: z.string(),
  alternativeThought: z.string(),
  emotions: Emotion.array().optional(),
  blockTimestamps: BlockTimestamps.optional(),
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
  situation: z.string().optional(),
  automaticThought: z.string(),
  cognitiveDistortions: z.set(Distortion.Distortion),
  challenge: z.string(),
  alternativeThought: z.string(),
  emotions: Emotion.array().optional(),
  blockTimestamps: BlockTimestamps.optional(),
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
  const nowIso = now.toISOString();
  const blockTimestamps: BlockTimestamps = {
    situation: nowIso,
    automaticThought: nowIso,
    distortions: nowIso,
    challenge: nowIso,
    alternativeThought: nowIso,
    ...(spec.blockTimestamps ?? {}),
  };
  return {
    situation: "",
    emotions: [],
    ...spec,
    createdAt,
    updatedAt,
    uuid,
    blockTimestamps,
  };
}
export function toSpec(t: Thought): Spec {
  return _.pick(t, [
    "situation",
    "automaticThought",
    "cognitiveDistortions",
    "challenge",
    "alternativeThought",
    "emotions",
    "blockTimestamps",
  ]);
}

export function emptySpec(): Spec {
  return {
    situation: "",
    automaticThought: "",
    cognitiveDistortions: new Set(),
    challenge: "",
    alternativeThought: "",
    emotions: [],
    blockTimestamps: {},
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
        situation: json.situation ?? "",
        emotions: json.emotions ?? [],
        blockTimestamps: json.blockTimestamps,
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
      const raw: Json = {
        automaticThought: t.automaticThought,
        cognitiveDistortions,
        challenge: t.challenge,
        alternativeThought: t.alternativeThought,
        createdAt,
        updatedAt,
        uuid: t.uuid,
        v: VERSION,
        ...(t.situation ? { situation: t.situation } : {}),
        ...(t.emotions && t.emotions.length > 0 ? { emotions: t.emotions } : {}),
        ...(t.blockTimestamps && Object.keys(t.blockTimestamps).length > 0
          ? { blockTimestamps: t.blockTimestamps }
          : {}),
      };
      return Json.decode(raw);
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

export interface EmotionDelta {
  diff: number;
  direction: "decrease" | "increase" | "same" | "none";
}

export function calculateEmotionDelta(
  initial: number,
  reassessed?: number
): EmotionDelta {
  if (reassessed === undefined || reassessed === null) {
    return { diff: 0, direction: "none" };
  }
  const diff = reassessed - initial;
  if (diff < 0) return { diff, direction: "decrease" };
  if (diff > 0) return { diff, direction: "increase" };
  return { diff: 0, direction: "same" };
}

export function getEmotionSuggestions(
  allThoughts: Iterable<Thought>,
  customEmotions: readonly string[] = [],
  query: string = "",
  excluded: readonly string[] = []
): string[] {
  const set = new Set<string>();
  for (const c of customEmotions) {
    if (c && c.trim()) set.add(c.trim());
  }
  for (const t of allThoughts) {
    if (t.emotions) {
      for (const e of t.emotions) {
        if (e.name && e.name.trim()) set.add(e.name.trim());
      }
    }
  }
  const excludedLower = new Set(excluded.map((e) => e.trim().toLowerCase()));
  const q = query.trim().toLowerCase();
  const list = Array.from(set).filter((item) => {
    const itemLower = item.toLowerCase();
    if (excludedLower.has(itemLower)) return false;
    if (!q) return true;
    return itemLower.includes(q);
  });
  return list.sort((a, b) => a.localeCompare(b));
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

export function getBlockTimestamp(
  t: Thought,
  block: keyof BlockTimestamps
): Date {
  const ts = t.blockTimestamps?.[block];
  if (ts) {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d;
  }
  return t.createdAt;
}
