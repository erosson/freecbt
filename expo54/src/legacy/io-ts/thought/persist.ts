import * as T from "io-ts"
import * as Distortion from "../distortion"

export const VERSION = "Thought-v1"

/**
 * our json-formatted thought data, as persisted to disk
 */
export const Persist = T.type(
  {
    v: T.literal(VERSION),
    automaticThought: T.string,
    alternativeThought: T.string,
    cognitiveDistortions: T.array(T.string),
    challenge: T.string,
    createdAt: T.string,
    updatedAt: T.string,
    uuid: T.string,
  },
  "Thought.Persist"
)
export type Persist = T.TypeOf<typeof Persist>

/**
 * old-style thoughts, as json
 * These were persisted in user data, so we must maintain decode support forever
 */
export const Legacy = T.intersection(
  [
    T.type({
      automaticThought: T.string,
      alternativeThought: T.string,
      cognitiveDistortions: T.array(Distortion.LegacyID),
      challenge: T.string,
      createdAt: T.string,
      updatedAt: T.string,
      uuid: T.string,
    }),
    T.partial({ v: T.undefined }),
  ],
  "Thought.Legacy"
)
export type Legacy = T.TypeOf<typeof Legacy>
