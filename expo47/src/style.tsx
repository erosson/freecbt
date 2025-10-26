import React from "react"
import { StyleSheet, TextStyle, ViewStyle } from "react-native"

export type Color = string
export interface Theme {
  background: Color
  text: Color
  textHeader: Color
  backgroundCard: Color
  border: Color
  textAction: Color

  backgroundSelected: Color
  backgroundCardSelected: Color
  borderSelected: Color
  textSelected: Color
  textHeaderSelected: Color
}

export const theme: { light: Theme; dark: Theme } = {
  light: {
    background: "white",
    text: "#596275",
    textHeader: "#303952",
    backgroundCard: "#f2f5fa",
    border: "#dadfeb",
    textAction: "#546de5",

    backgroundSelected: "#778beb",
    backgroundCardSelected: "#546de5",
    borderSelected: "#546de5",
    textSelected: "white",
    textHeaderSelected: "white",
  },
  dark: {
    background: "#000",
    text: "#fff",
    textHeader: "#fff",
    backgroundCard: "#444",
    border: "#444",
    textAction: "#0cc",

    // backgroundSelected: "cyan",
    backgroundSelected: "#0ff",
    backgroundCardSelected: "#0cc",
    borderSelected: "#0cc",
    textSelected: "#000",
    textHeaderSelected: "#000",
  },
}
export type ThemeName = keyof typeof theme
export const themeNames = Object.keys(theme) as ThemeName[]

function createStyle(t: Theme) {
  const text = {
    color: t.text,
  } as TextStyle
  const textAction = {
    color: t.textAction,
  } as TextStyle
  const border = {
    borderColor: t.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth * 3,
    padding: 4,
  }
  const subheader = {
    color: t.textHeader,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 12,
  } as TextStyle
  const header = {
    color: t.textHeader,
    fontWeight: "900",
    fontSize: 48,
    marginBottom: 12,
  } as TextStyle
  const card = {
    color: t.text,
    backgroundColor: t.backgroundCard,
    borderColor: t.backgroundCard,
    borderRadius: 8,
    padding: 4,
  }
  const button = {
    ...card,
    ...border,
  }
  const buttonAction = {
    ...button,
    ...textAction,
  }
  const paragraph = {
    ...text,
    fontWeight: "400",
    fontSize: 16,
  } as TextStyle

  return StyleSheet.create({
    text,
    textAction,
    border,
    subheader,
    header,
    card,
    paragraph,
    button,
    buttonAction,
    view: { backgroundColor: t.background } as ViewStyle,

    // selected
    selectedText: {
      color: t.textSelected,
      // backgroundColor: theme2.backgroundSelected,
    },
    selectedBorder: {
      ...border,
      borderColor: t.borderSelected,
    },
    selectedSubheader: {
      ...subheader,
      color: t.textHeaderSelected,
      // backgroundColor: theme2.backgroundSelected,
    },
    selectedCard: {
      ...card,
      color: t.textSelected,
      backgroundColor: t.backgroundCardSelected,
      borderColor: t.borderSelected,
    },
    selectedParagraph: {
      ...paragraph,
      color: t.textSelected,
      // backgroundColor: theme2.backgroundSelected,
    },
    selectedView: { backgroundColor: t.backgroundSelected } as ViewStyle,
  })
}
// don't make me explicitly specify this type, please
export type Style = ReturnType<typeof createStyle>

export const dark: Style = createStyle(theme.dark)
export const light: Style = createStyle(theme.light)
export const style: { [f in keyof typeof theme]: Style } = { dark, light }
// const default_ = dark
const default_ = light

export type Context_ = {
  style: Style
  updateStyle: (a: Style | ThemeName) => void
}
export const Context = React.createContext<Context_>({
  style: default_,
  updateStyle: () => {},
})

export function State(props: { children: React.ReactNode }): React.JSX.Element {
  const [s, updateStyle] = React.useReducer(
    (_: Style, action: Style | ThemeName): Style => {
      return typeof action === "string" ? style[action] : action
    },
    default_
  )
  return (
    <Context.Provider value={{ style: s, updateStyle }}>
      {props.children}
    </Context.Provider>
  )
}

export function withState(Component: React.ComponentType) {
  return () => (
    <State>
      <Component />
    </State>
  )
}

export function useStyleContext(): Context_ {
  return React.useContext(Context)
}
export function useStyle(): Style {
  return useStyleContext().style
}
