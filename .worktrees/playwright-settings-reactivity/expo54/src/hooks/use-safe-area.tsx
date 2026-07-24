import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * same as useSafeAreaFrame(), but supports window resizing on web.
 */
export function useSafeWindowDimensions() {
  const w = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const width = w.width - insets.left - insets.right;
  const height = w.height - insets.top - insets.bottom;
  return { ...w, width, height };
}
