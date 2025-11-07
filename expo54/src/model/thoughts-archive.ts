import * as LZ from "lz-string";
import { z } from "zod";
import * as Distortion from "./distortion";
import * as Thought from "./thought";

export const VERSION = "Archive-v2";

export const Json = z.object({
  v: z.string().optional(),
  thoughts: Thought.Json.array(),
});
export type Json = z.infer<typeof Json>;

export const Archive = z.object({
  thoughts: Thought.Thought.array(),
});
export type Archive = z.infer<typeof Archive>;

const affix = ":FreeCBT:";
export const jsonFromString = z.codec(
  z.string().startsWith(affix).endsWith(affix),
  Json,
  {
    decode: (enc: string) => {
      const lz = enc.substring(affix.length, enc.length - affix.length);
      const str = LZ.decompressFromBase64(lz);
      //   console.log("archive-decode", { enc, lz, str });

      // decompress returns "" on error. But "" is valid output too, since we
      // can compress ""! Special-case that one.
      if (str === null || (str === "" && lz !== "Q===")) {
        throw new Error("lz-string decompressFromBase64 failed");
      }
      return JSON.parse(str);
    },
    encode: (json: z.input<typeof Json>) => {
      const str = JSON.stringify(json);
      const lz = LZ.compressToBase64(str);
      const enc = `${affix}${lz}${affix}`;
      return enc;
    },
  }
);

export function create(thoughts: Thought.Thought[]): Archive {
  return { thoughts };
}

export function createParsers(data: Distortion.Data) {
  const T = Thought.createParsers(data);

  const fromJson = z.codec(Json, Archive, {
    decode: (json: Json) => {
      const { v } = json;
      const thoughts = json.thoughts.map((t) => T.fromJson.decode(t));
      return { v, thoughts };
    },
    encode: (arc: z.input<typeof Archive>) => {
      const thoughts = Archive.decode(arc).thoughts.map((t) =>
        T.fromJson.encode(t)
      );
      return { v: VERSION, thoughts };
    },
  });

  const fromString = jsonFromString.pipe(fromJson);
  return { fromJson, fromString };
}
