import { Platform } from "react-native";

export function isPlatformSupported() {
  return Platform.OS === "android" || Platform.OS === "ios";
}
