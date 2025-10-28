import AsyncStorage from "@react-native-async-storage/async-storage"

const PREFIX = `@SettingsStore:`

function getKey(slug: string) {
  return PREFIX + slug
}

export async function getSetting(slug: string): Promise<string | null> {
  return await AsyncStorage.getItem(getKey(slug))
}
export async function getSettingOrDefault(
  slug: string,
  defaultValue: string
): Promise<string> {
  try {
    return (await AsyncStorage.getItem(getKey(slug))) || defaultValue
  } catch (err) {
    console.error(err)
    return ""
  }
}

export async function getSettingOrSetDefault(
  slug: string,
  defaultValue: string
): Promise<string> {
  try {
    const result = await AsyncStorage.getItem(getKey(slug))

    if (!result || result.length === 0) {
      // We don't use the wrapped version of setSetting here
      // so we correctly attribute the error
      await AsyncStorage.setItem(getKey(slug), defaultValue)
      // we'll never use the `?? defaultValue` below, but typescript insists
      return (await AsyncStorage.getItem(getKey(slug))) ?? defaultValue
    }

    return result
  } catch (err) {
    console.error(err)
    return ""
  }
}

export async function setSetting<T extends string>(
  slug: string,
  value: T
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(getKey(slug), value)
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

export async function removeSetting(slug: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(getKey(slug))
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}
