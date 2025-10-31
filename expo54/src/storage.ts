import { Distortion, Model, Settings, Thought } from "@/src/model";
import { AsyncStorageStatic } from "@react-native-async-storage/async-storage";
import { z } from "zod";

export function settings(storage: AsyncStorageStatic) {
  async function read(): Promise<Settings.Settings> {
    const json = Object.fromEntries(await storage.multiGet(Settings.keys));
    return Settings.fromJson.parse(json);
  }
  async function write(s: Settings.Settings): Promise<void> {
    const json = Settings.fromJson.encode(s);
    const entries = Object.entries(json);
    const removes = entries.filter(([, v]) => v === null).map(([k]) => k);
    const sets = entries.filter((p): p is [string, string] => p[1] !== null);
    await Promise.all([storage.multiRemove(removes), storage.multiSet(sets)]);
  }
  async function clear() {
    await storage.multiRemove(Settings.keys);
  }
  return { read, write, clear };
}
export type Settings = ReturnType<typeof settings>;

export function thoughts(data: Distortion.Data, storage: AsyncStorageStatic) {
  const T = Thought.createParsers(data);

  async function readKeys(): Promise<readonly string[]> {
    const keys = await storage.getAllKeys();
    return keys.filter(Thought.isKey);
  }
  async function readAll(): Promise<
    Pick<Model.Ready, "thoughts" | "thoughtParseErrors">
  > {
    const keys = await readKeys();
    const pairs = await storage.multiGet(keys);
    const parsed = pairs.map(
      ([k, enc]) => [Thought.idFromKey(k), T.fromString.safeParse(enc)] as const
    );
    const thoughts = new Map(
      parsed
        .filter(([, t]) => t.success)
        .map(([id, t]) => [id, t.data] as const)
    ) as ReadonlyMap<string, Thought.Thought>;
    const thoughtParseErrors = new Map(
      parsed
        .filter(([id, t]) => [id, !t.success])
        .map(([id, t]) => [id, t.error] as const)
    ) as ReadonlyMap<string, z.ZodError<Thought.Thought>>;
    return { thoughts, thoughtParseErrors };
  }
  async function write(t: Thought.Thought): Promise<void> {
    const enc = T.fromString.encode(t);
    return await storage.setItem(t.uuid, enc);
  }
  async function read(id: string): Promise<Thought.Thought> {
    const enc = await storage.getItem(id);
    if (enc === null) throw new Error(`no such thought-id: ${id}`);
    return T.fromString.decode(enc);
  }
  async function remove(id: string): Promise<void> {
    await storage.removeItem(id);
  }
  async function clear() {
    const keys = await readKeys();
    await storage.multiRemove(keys);
  }
  return { readKeys, readAll, read, write, remove, clear };
}

export type Thought = ReturnType<typeof thoughts>;
