import React from "react"
import { SubHeader } from "../ui"
import { View, TextInput } from "react-native"
import i18n from "../i18n"
import { textInputStyle, textInputPlaceholderColor } from "./textInputStyle"
import theme from "../theme"

const CHALLENGE = `George might be busy. I can't expect to have immediate access to his time.`

export default function Challenge(props: {
  value: string
  onChange: (v: string) => void
}) {
  const { value, onChange } = props

  return (
    <>
      <View
        style={{
          display: "flex",
        }}
      >
        <SubHeader
          style={{
            marginBottom: 6,
          }}
        >
          {i18n.t("challenge")}
        </SubHeader>
        <TextInput
          style={{
            ...textInputStyle,
            backgroundColor: "white",
          }}
          placeholderTextColor={textInputPlaceholderColor}
          placeholder={i18n.t("cbt_form.changed_placeholder")}
          value={value}
          multiline={true}
          numberOfLines={6}
          onChangeText={onChange}
        />
      </View>
    </>
  )
}
