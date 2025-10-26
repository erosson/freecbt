import * as T from "io-ts"
import { setFromArray, DateFromISOString } from "io-ts-types"
import * as Distortion from "../distortion"
// import this polyfill before `uuid`: https://www.npmjs.com/package/uuid#user-content-getrandomvalues-not-supported
import "react-native-get-random-values"
import { v4 as uuidv4 } from "uuid"
import { VERSION } from "./persist"

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

export const Thought = T.type(
  {
    v: T.literal(VERSION),
    automaticThought: T.string,
    alternativeThought: T.string,
    cognitiveDistortions: Distortion.SetCodec,
    challenge: T.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    uuid: ID,
  },
  "Thought"
)
export type Thought = T.TypeOf<typeof Thought>

export interface CreateArgs {
  automaticThought: string
  alternativeThought: string
  cognitiveDistortions: Iterable<Distortion.Distortion | string>
  challenge: string
  createdAt?: Date
  updatedAt?: Date
  uuid?: string
}
export const THOUGHTS_KEY_PREFIX = `@Quirk:thoughts:`
export function getThoughtKey(info: string): string {
  return `${THOUGHTS_KEY_PREFIX}${info}`
}

export function create(args: CreateArgs): Thought {
  const cognitiveDistortions = new Set(
    Array.from(args.cognitiveDistortions).map((name) => {
      const d = typeof name === "string" ? Distortion.bySlug[name] : name
      if (!d) {
        throw new Error(`no such distortion: ${name}`)
      }
      return d
    })
  )
  const uuid = args.uuid ?? getThoughtKey(uuidv4())
  return {
    ...args,
    cognitiveDistortions,
    uuid,
    createdAt: args.createdAt ?? new Date(),
    updatedAt: args.updatedAt ?? new Date(),
    v: VERSION,
  }
}

export interface Group {
  date: string
  thoughts: Thought[]
}

export function groupByDay(thoughts: Thought[]): Group[] {
  const dates: string[] = []
  const groups: Group[] = []

  const sortedThoughts = thoughts.sort(
    (first, second) => second.createdAt.getTime() - first.createdAt.getTime()
  )

  for (const thought of sortedThoughts) {
    const date = thought.createdAt.toDateString()
    if (!dates.includes(date)) {
      dates.push(date)
      groups.push({
        date,
        thoughts: [thought],
      })
      continue
    }

    groups[dates.length - 1].thoughts.push(thought)
  }

  return groups
}
