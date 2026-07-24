import { Persist, Legacy, VERSION } from "./persist"
import { Thought } from "./thought"
import * as T from "io-ts"
import { pipe } from "fp-ts/lib/function"
import * as Distortion from "../distortion"

const FromPersist = Persist.pipe(Thought)

// encoding legacy-thoughts is still useful for testing
export const FromLegacy = Legacy.pipe(
  new T.Type(
    "ThoughtFromLegacy",
    Thought.is,
    // the distortion codec understands the legacy format, no need to transform them here
    (leg: Legacy, c) => Thought.validate({ ...leg, v: VERSION }, c),
    (dis: Thought): Legacy => ({
      ...FromPersist.encode(dis),
      v: undefined,
      cognitiveDistortions: pipe(
        dis.cognitiveDistortions,
        Array.from,
        T.array(Distortion.FromLegacy).encode
      ),
    })
  )
)

export const Codec: typeof FromPersist = new T.Type(
  "Thought.Codec",
  FromPersist.is,
  T.union([FromPersist, FromLegacy]).validate,
  FromPersist.encode
)
