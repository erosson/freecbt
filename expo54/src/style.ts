import { Appearance, StyleSheet } from "react-native";

export const DarkColors = {
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
export const LightColors: typeof DarkColors = {
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
export const C =
  Appearance.getColorScheme() === "dark" ? DarkColors : LightColors;

export const S = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.background,
  },
  header: {
    fontWeight: "900",
    fontSize: 48,
    color: C.text,
    marginBottom: 12,
  },
  text: {
    color: C.text,
  },
  carouselItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: C.border,
    justifyContent: "center",
    padding: 20,
  },
  textInput: {
    height: 156,
    backgroundColor: C.background,
    padding: 12,
    paddingTop: 14,
    borderRadius: 8,
    fontSize: 16,
    borderColor: C.border,
    borderWidth: 1,
    color: C.text,
  },
  button: {
    backgroundColor: C.button,
    // color: C.buttonText,
    fontWeight: 700,
    fontSize: 16,
    padding: 12,
    borderRadius: 10,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 48,
    width: 120,
  },
  buttonText: {
    color: C.buttonText,
  },
  flexColumn: {
    flexDirection: "column",
  },
  formDistortionItem: {
    backgroundColor: C.background,
    borderColor: C.border,
    borderBottomWidth: 2,
    paddingTop: 8,
    paddingBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
    marginTop: 1,
  },
  formDistortionItemSelected: {
    backgroundColor: C.selectedBackground,
    borderColor: C.selectedBorder,
  },
  formDistortionItemSelectedText: {
    color: C.selectedText,
  },
});
