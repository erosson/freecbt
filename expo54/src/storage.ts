import { Distortion, Model, Settings, Thought } from "@/src/model";
import { AsyncStorageStatic } from "@react-native-async-storage/async-storage";

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

  async function readKeys(): Promise<readonly Thought.Key[]> {
    const keys = await storage.getAllKeys();
    return keys
      .map((k) => Thought.Key.safeDecode(k))
      .filter((k) => k.success)
      .map((k) => k.data);
  }
  async function readAll(): Promise<
    Pick<Model.Ready, "thoughts" | "thoughtParseErrors">
  > {
    const keys = await readKeys();
    const pairs = await storage.multiGet(keys);
    const parsed = pairs.map(
      ([k, enc]) =>
        [Thought.Key.decode(k), T.fromString.safeParse(enc)] as const
    );
    return {
      thoughts: new Map(
        parsed
          .filter(([, t]) => t.success)
          .map(([k, t]) => [k, t.data!] as const)
      ),
      thoughtParseErrors: new Map(
        parsed
          .filter(([, t]) => !t.success)
          .map(([k, t]) => [k, t.error!] as const)
      ),
    };
  }
  async function write(t: Thought.Thought): Promise<void> {
    const enc = T.fromString.encode(t);
    const key = Thought.key(t);
    return await storage.setItem(key, enc);
  }
  async function read(id: Thought.Key): Promise<Thought.Thought> {
    const enc = await storage.getItem(id);
    if (enc === null) throw new Error(`no such thought-id: ${id}`);
    return T.fromString.decode(enc);
  }
  async function remove(id: Thought.Key): Promise<void> {
    await storage.removeItem(id);
  }
  async function clear() {
    const keys = await readKeys();
    await storage.multiRemove(keys);
  }
  return { readKeys, readAll, read, write, remove, clear };
}

export type Thought = ReturnType<typeof thoughts>;
