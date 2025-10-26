import AsyncStorage from "@react-native-async-storage/async-storage";

export async function thoughtsKeys(): Promise<readonly string[]> {
  //   if (typeof window === "undefined") {
  // return new Promise(() => {});
  // return Promise.resolve([]);
  // return Promise.reject("ssr");
  //   }
  return AsyncStorage.getAllKeys();
}
