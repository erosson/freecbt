import * as T from "io-ts"
import * as Thought from "./thought"
import * as LZ from "lz-string"
import { JsonFromString } from "io-ts-types"
import { pipe } from "fp-ts/lib/function"

const VERSION = "Archive-v1"

export const Archive = T.type(
  {
    v: T.literal(VERSION),
    thoughts: T.array(Thought.Persist),
  },
  "Archive.Raw"
)
export type Archive = T.TypeOf<typeof Archive>

export function create(thoughts: Thought.Persist[]): Archive {
  return { v: VERSION, thoughts }
}

const LZStringBase64 = T.string.pipe(
  new T.Type(
    "LZString",
    T.string.is,
    (input: string, c) => {
      const ret = LZ.decompressFromBase64(input)
      // decompress returns "" on error. But "" is valid output too, since we
      // can compress ""! Special-case that one.
      return ret === null || (ret === "" && input !== "Q===")
        ? T.failure("Invalid lz-string encoding", c)
        : T.success(ret)
    },
    LZ.compressToBase64
  )
)

function FromPrefix(
  pre: string,
  message: string
): T.Type<string, string, string> {
  return new T.Type(
    `FromPrefix(${pre})`,
    T.string.is,
    (enc: string, c) =>
      enc.startsWith(pre)
        ? T.success(enc.slice(pre.length))
        : T.failure(message, c),
    (dec: string) => `${pre}${dec}`
  )
}

function FromSuffix(
  suf: string,
  message: string
): T.Type<string, string, string> {
  return new T.Type(
    `FromSuffix(${suf})`,
    T.string.is,
    (enc: string, c) =>
      enc.endsWith(suf)
        ? T.success(enc.slice(0, -suf.length))
        : T.failure(message, c),
    (dec: string) => `${dec}${suf}`
  )
}

// A FreeCBT archive string is a prefix, followed by an LZString-base64-compressed json body
export const Codec: T.Type<Archive, string> = T.string
  .pipe(FromPrefix(":FreeCBT:", "Not a FreeCBT archive"))
  .pipe(FromSuffix(":FreeCBT:", "Not a FreeCBT archive"))
  .pipe(LZStringBase64)
  .pipe(JsonFromString)
  .pipe(Archive, "Archive.Codec")
