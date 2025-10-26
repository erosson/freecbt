import { AsyncStorageStatic } from "@react-native-async-storage/async-storage";
import z from "zod";
import { Distortion, Thought } from "../model";

export function useStorage(data: Distortion.Data, storage: AsyncStorageStatic) {
  const T = Thought.createParsers(data);

  async function readThoughtsKeys(): Promise<readonly string[]> {
    const keys = await storage.getAllKeys();
    return keys.filter(Thought.isKey);
  }
  async function readThoughts(): Promise<
    readonly z.ZodSafeParseResult<Thought.Thought>[]
  > {
    const keys = await readThoughtsKeys();
    const pairs = await storage.multiGet(keys);
    return pairs.map(([, enc]) => T.fromString.safeParse(enc));
  }
  async function writeThought(t: Thought.Thought): Promise<void> {
    const enc = T.fromString.encode(t);
    return await storage.setItem(t.uuid, enc);
  }
  async function readThought(id: string): Promise<Thought.Thought> {
    const enc = await storage.getItem(id);
    if (enc === null) throw new Error(`no such thought-id: ${id}`);
    return T.fromString.decode(enc);
  }
  /** if only it was this easy */
  async function removeThought(id: string): Promise<void> {
    await storage.removeItem(id);
  }
  async function clearThoughts() {
    const keys = await readThoughtsKeys();
    await storage.multiRemove(keys);
  }
  return {
    readThoughtsKeys,
    readThoughts,
    readThought,
    writeThought,
    removeThought,
    clearThoughts,
  };
}
