import * as T from "io-ts"

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

export const VERSION = undefined

/**
 * old-style distortions. These are persisted in user data, so we must maintain decode support forever
 */
export const Legacy = T.intersection(
  [
    T.type({
      slug: ID,
      label: T.string,
      description: T.string,
    }),
    T.partial({
      v: T.undefined,
      emoji: T.union([T.string, T.array(T.string)]),
      selected: T.boolean,
    }),
  ],
  "Distortion.Legacy"
)
export type Legacy = T.TypeOf<typeof Legacy>

export const LegacyID = T.intersection([
  T.type({ slug: ID }),
  T.partial({ selected: T.boolean }),
])
export type LegacyID = T.TypeOf<typeof LegacyID>

export const FilterSelected = T.array(LegacyID).pipe(
  new T.Type(
    "FilterSelected",
    T.array(LegacyID).is,
    (enc: LegacyID[], c) => T.success(enc.filter((l) => !!l.selected)),
    (dec: LegacyID[]) => dec
  )
)
