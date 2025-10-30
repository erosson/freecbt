import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";

const PREFIX = `@SettingsStore:`;

export const LOCALE_KEY = "locale";

export function useSettingsStorage(storage: AsyncStorageStatic = AsyncStorage) {
  async function readKeys(): Promise<readonly string[]> {
    const keys = await storage.getAllKeys();
    return keys.filter((key) => key.startsWith(PREFIX));
  }
  async function readAll(): Promise<readonly (readonly [string, string])[]> {
    const keys = await readKeys();
    const pairs: readonly (readonly [string, string | null])[] =
      await storage.multiGet(keys);
    // non-null is basically guaranteed since we're only reading keys that exist - but filter anyway, just in case race conditions
    return pairs.filter((pair): pair is readonly [string, string] => !!pair[1]);
  }
  async function write(k: string, v: string): Promise<void> {
    return await storage.setItem(toKey(k), v);
  }
  async function read(k: string): Promise<string | null> {
    return await storage.getItem(toKey(k));
  }
  async function remove(k: string): Promise<void> {
    await storage.removeItem(toKey(k));
  }
  async function clear() {
    const keys = await readKeys();
    await storage.multiRemove(keys);
  }
  return { readKeys, readAll, read, write, remove, clear };
}
export type SettingsStorage = ReturnType<typeof useSettingsStorage>;

function toKey(slug: string) {
  return PREFIX + slug;
}
