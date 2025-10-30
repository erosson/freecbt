import { Distortion, Thought } from "@/src/model";
import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";
import { z } from "zod";

export function useThoughtStorage(
  data: Distortion.Data,
  storage: AsyncStorageStatic = AsyncStorage
) {
  const T = Thought.createParsers(data);

  async function readKeys(): Promise<readonly string[]> {
    const keys = await storage.getAllKeys();
    return keys.filter(Thought.isKey);
  }
  async function readAll(): Promise<
    readonly z.ZodSafeParseResult<Thought.Thought>[]
  > {
    const keys = await readKeys();
    const pairs = await storage.multiGet(keys);
    return pairs.map(([, enc]) => T.fromString.safeParse(enc));
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
