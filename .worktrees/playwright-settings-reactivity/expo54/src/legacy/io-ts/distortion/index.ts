export { Distortion, ID, VERSION, ord } from "./distortion"
export { Legacy, LegacyID } from "./legacy"
export { default as list } from "./data"
export { bySlug, FromLegacy, Codec, SetCodec } from "./codec"

import { Distortion } from "./distortion"
import { Legacy } from "./legacy"
import { FromLegacy } from "./codec"
import list from "./data"
import { sortBy } from "lodash"

export function sortedList(): Distortion[] {
  return sortBy(list, (d) => d.label().toUpperCase())
}
export const sortedBySlug: Distortion[] = sortBy(list, (d) => d.slug)

export function legacyDistortions(): Legacy[] {
  return sortedList().map(FromLegacy.encode)
}
