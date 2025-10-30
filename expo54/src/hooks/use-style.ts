import { StyleSheet } from "react-native";
import { useColorScheme } from "./use-color-scheme";

export function useTheme(): Theme {
  const [c] = useColorScheme();
  console.log("usecolorscheme", c);
  switch (c) {
    case "dark":
      return DarkTheme;
    case "light":
      return LightTheme;
    default: {
      const e: never = c;
      throw new Error(`unknown color scheme: ${e}`);
    }
  }
}
export function useStyle() {
  return style(useTheme());
}

export const DarkTheme = {
  text: "white",
  background: "black",
  border: "rgba(255,255,255,0.2)",
  button: "cyan",
  buttonText: "black",
  paginationDot: "rgba(255,255,255,0.2)",
  selectedText: "white",
  selectedBackground: "blue",
  selectedBorder: "darkblue",
};
export type Theme = typeof DarkTheme;
export const LightTheme: Theme = {
  text: "black",
  background: "white",
  border: "rgba(0,0,0,0.2)",
  button: "blue",
  buttonText: "white",
  paginationDot: "rgba(0,0,0,0.2)",
  selectedText: "white",
  selectedBackground: "blue",
  selectedBorder: "darkblue",
};

const spacing = 4;
function style(c: Theme) {
  // Tailwind-style utility classes.
  // Very incomplete, feel free to expand. Try to match tailwind's names.
  const U = StyleSheet.create({
    rounded: { borderRadius: 2 },
    justifyCenter: { justifyContent: "center" },
    itemsCenter: { alignItems: "center" },
    itemsStart: { alignItems: "flex-start" },
    flex1: { flex: 1 },
    flexRow: { flexDirection: "row" },
    flexCol: { flexDirection: "column" },
    justifyBetween: { justifyContent: "space-between" },
    underline: { textDecorationLine: "underline" },

    m1: { margin: spacing * 1 },
    m2: { margin: spacing * 2 },
    m3: { margin: spacing * 3 },
    m4: { margin: spacing * 4 },
    mx1: { marginHorizontal: spacing * 1 },
    mx2: { marginHorizontal: spacing * 2 },
    mx3: { marginHorizontal: spacing * 3 },
    mx4: { marginHorizontal: spacing * 4 },
    my1: { marginVertical: spacing * 1 },
    my2: { marginVertical: spacing * 2 },
    my3: { marginVertical: spacing * 3 },
    my4: { marginVertical: spacing * 4 },
    mt1: { marginTop: spacing * 1 },
    mt2: { marginTop: spacing * 2 },
    mt3: { marginTop: spacing * 3 },
    mt4: { marginTop: spacing * 4 },
    p1: { padding: spacing * 1 },
    p2: { padding: spacing * 2 },
    p3: { padding: spacing * 3 },
    p4: { padding: spacing * 4 },
    px1: { paddingHorizontal: spacing * 1 },
    px2: { paddingHorizontal: spacing * 2 },
    px3: { paddingHorizontal: spacing * 3 },
    px4: { paddingHorizontal: spacing * 4 },
    py1: { paddingVertical: spacing * 1 },
    py2: { paddingVertical: spacing * 2 },
    py3: { paddingVertical: spacing * 3 },
    py4: { paddingVertical: spacing * 4 },
    pt1: { paddingTop: spacing * 1 },
    pt2: { paddingTop: spacing * 2 },
    pt3: { paddingTop: spacing * 3 },
    pt4: { paddingTop: spacing * 4 },

    text: { color: c.text },
    bg: { backgroundColor: c.background },
  });

  // application-specific "class names"
  return StyleSheet.create({
    ...U,
    view: { ...U.flex1, ...U.bg, ...U.p4 },
    centeredView: {
      ...U.flex1,
      ...U.bg,
      ...U.justifyCenter,
      ...U.itemsCenter,
    },
    href: { ...U.underline, ...U.text },
    header: {
      fontWeight: "900",
      fontSize: 48,
      color: c.text,
      marginBottom: 12,
    },
    subheader: {
      fontWeight: "700",
      fontSize: 18,
      color: c.text,
      marginBottom: 12,
    },
    carouselItem: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: c.border,
      justifyContent: "center",
      padding: 20,
    },
    textInput: {
      height: 156,
      backgroundColor: c.background,
      padding: 12,
      paddingTop: 14,
      borderRadius: 8,
      fontSize: 16,
      borderColor: c.border,
      borderWidth: 1,
      color: c.text,
    },
    button: {
      backgroundColor: c.button,
      // color: C.buttonText,
      fontWeight: 700,
      fontSize: 16,
      padding: 12,
      borderRadius: 10,
      textAlign: "center",
      justifyContent: "center",
      alignItems: "center",
      maxHeight: 48,
      // width: 120,
    },
    buttonText: {
      color: c.buttonText,
    },
    flexColumn: {
      flexDirection: "column",
    },
    formDistortionItem: {
      backgroundColor: c.background,
      borderColor: c.border,
      borderBottomWidth: 2,
      paddingTop: 8,
      paddingBottom: 4,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 4,
      marginTop: 1,
    },
    formDistortionItemSelected: {
      backgroundColor: c.selectedBackground,
      borderColor: c.selectedBorder,
    },
    formDistortionItemSelectedText: {
      color: c.selectedText,
    },
  });
}
