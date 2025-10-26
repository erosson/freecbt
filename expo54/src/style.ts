import { StyleSheet } from "react-native";

export const S = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontWeight: "900",
    fontSize: 48,
    color: "black",
    marginBottom: 12,
  },
  carouselItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "lightgray",
    justifyContent: "center",
    padding: 20,
  },
  textInput: {
    height: 156,
    backgroundColor: "white",
    padding: 12,
    paddingTop: 14,
    borderRadius: 8,
    fontSize: 16,
    // borderColor: theme.lightGray,
    borderColor: "lightgray",
    borderWidth: 1,
    // color: theme.darkText,
    color: "black",
  },
  button: {
    backgroundColor: "blue",
    color: "white",
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
});
