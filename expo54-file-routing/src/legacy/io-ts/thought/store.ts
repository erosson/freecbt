import AsyncStorage from "@react-native-async-storage/async-storage"
import * as AsyncState from "../../async-state"
import * as T from "io-ts"
import { JsonFromString } from "io-ts-types"
import * as E from "fp-ts/lib/Either"
import { Thought, ID, THOUGHTS_KEY_PREFIX } from "./thought"
import { Persist } from "./persist"
import { Codec } from "./codec"
import { decodeOrThrow } from "../io-utils"
import * as Archive from "../archive"
import { KeyValuePair } from "@react-native-async-storage/async-storage/lib/typescript/types"
import { pipe } from "fp-ts/lib/function"
import { scryRenderedComponentsWithType } from "react-dom/test-utils"

const EXISTING_USER_KEY = "@Quirk:existing-user"

export async function exists(key: ID): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(key)
    return !!value
  } catch (err) {
    console.error(err)
    return false
  }
}

export async function getIsExistingUser(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(EXISTING_USER_KEY)
    return !!value
  } catch (err) {
    console.error(err)
    return false
  }
}

export async function setIsExistingUser() {
  try {
    await AsyncStorage.setItem(EXISTING_USER_KEY, "true")
  } catch (err) {
    console.error(err)
  }
}

export async function write(t: Thought): Promise<void> {
  const enc = Codec.encode(t)
  const raw = JSON.stringify(enc)
  await AsyncStorage.setItem(t.uuid, raw)
}

export async function read(id: ID): Promise<Thought> {
  return parseOrThrow((await AsyncStorage.getItem(id)) ?? "")
}
export async function readResult(
  id: ID
): Promise<AsyncState.Result<Thought, ParseError>> {
  return parseResult((await AsyncStorage.getItem(id)) ?? "", id)
}

export interface ParseError {
  error: any
  raw: string
  id: ID
}
function parseOrThrow(raw: string): Thought {
  const enc = JSON.parse(raw)
  return decodeOrThrow(Codec, enc)
}
function parseResult(
  raw: string,
  id: ID
): AsyncState.Result<Thought, ParseError> {
  return AsyncState.mapError(
    AsyncState.tryResult(() => parseOrThrow(raw)),
    (error) => ({ error, raw, id })
  )
}

export async function remove(uuid: ID) {
  try {
    await AsyncStorage.removeItem(uuid)
  } catch (error) {
    console.error(error)
  }
}

export async function getExercisesKeys(): Promise<string[]> {
  const allKeys = await AsyncStorage.getAllKeys()
  return allKeys.filter((key) => key.startsWith(THOUGHTS_KEY_PREFIX))
}
export async function getRawExercises(): Promise<readonly KeyValuePair[]> {
  const keys = await getExercisesKeys()
  return await AsyncStorage.multiGet(keys)
}
export async function getExercises(): Promise<
  AsyncState.Result<Thought, ParseError>[]
> {
  const rows = await getRawExercises()
  return rows.map(([key, raw]) => parseResult(raw ?? "", key))
}

export async function getValidExercises(): Promise<Thought[]> {
  const ts = await getExercises()
  return ts.filter(AsyncState.isSuccess).map((t) => t.value)
}

export const countThoughts = async (): Promise<number> => {
  const exercises = await getExercises()
  return exercises.length
}

export async function readArchive(): Promise<Archive.Archive> {
  const rows = await getRawExercises()
  const thoughts: Persist[] = rows
    .map(([key, raw]) => {
      const result = JsonFromString.pipe(Persist).decode(raw ?? "")
      return E.fold(
        (err) => [],
        (persist: Persist) => [persist]
      )(result)
    })
    .flat()
  return Archive.create(thoughts)
}

export async function writeArchive(archive: Archive.Archive): Promise<void> {
  const rows: [string, string][] = archive.thoughts.map((entry) => [
    entry.uuid,
    JsonFromString.pipe(Persist).encode(entry),
  ])
  const oldKeys = await getExercisesKeys()
  // asyncstorage gets upset about empty lists, even though there's nothing wrong with them in theory
  if (oldKeys.length) {
    await AsyncStorage.multiRemove(oldKeys)
  }
  if (rows.length) {
    await AsyncStorage.multiSet(rows)
  }
}

export async function readArchiveString(): Promise<string> {
  return pipe(await readArchive(), Archive.Codec.encode)
}

export async function writeArchiveString(
  enc: string
): Promise<T.Errors | null> {
  return pipe(
    enc.trim(),
    Archive.Codec.decode,
    E.fold(
      async (err: T.Errors): Promise<T.Errors | null> => err,
      async (dec: Archive.Archive) => {
        await writeArchive(dec)
        return null
      }
    )
  )
}
