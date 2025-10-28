import React from "react"
import { SelectorTextItem, SubHeader } from "../ui"
import { View, ScrollView, Text, Switch, TouchableOpacity } from "react-native"
import i18n from "../i18n"
import * as Distortion from "../io-ts/distortion"
import theme from "../theme"
import * as Bubbles from "../imgs/Bubbles"
import * as Style from "../style"

export default (props: {
  list?: Distortion.Distortion[]
  selected: Set<Distortion.Distortion>
  onChange: (slug: string) => void
}) => {
  const list: Distortion.Distortion[] = props.list ?? Distortion.sortedList()
  const items: { distortion: Distortion.Distortion; selected: boolean }[] =
    list.map((distortion) => ({
      distortion,
      selected: props.selected.has(distortion),
    }))
  const style = Style.useStyle()
  const [details, setDetails] = React.useState(false)
  return (
    <>
      <TouchableOpacity
        onPress={() => setDetails(!details)}
        style={{ marginBottom: 8 }}
      >
        <SubHeader style={{ marginBottom: 8 }}>
          {i18n.t("cog_distortion")}
        </SubHeader>
        <View style={{ flexDirection: "row" }}>
          <Text>
            <Switch value={details} onValueChange={(val) => setDetails(val)} />
          </Text>
          <Text
            style={{
              alignSelf: "flex-end",
              height: "100%",
              textAlignVertical: "center",
              marginLeft: 8,
              fontSize: 16,
            }}
            onPress={() => setDetails(!details)}
          >
            {i18n.t("cbt_form.show_details")}
          </Text>
        </View>
      </TouchableOpacity>
      <ScrollView>
        <View
          style={{
            paddingBottom: 160,
          }}
        >
          <RoundedSelector
            extended={details}
            items={items}
            onPress={props.onChange}
          />
        </View>
      </ScrollView>
    </>
  )
}

function RoundedSelector(props: {
  items: { selected: boolean; distortion: Distortion.Distortion }[]
  extended?: boolean
  onPress: (slug: string) => void
  style?: object
}) {
  const style = Style.useStyle()
  return (
    <View
      style={{
        backgroundColor: theme.lightOffwhite,
        ...props.style,
      }}
    >
      {props.items.map(({ distortion, selected }, i) => {
        const bubble = Bubbles.colors[i % Bubbles.colors.length]
        const description = props.extended ? (
          <>
            <Text
              style={[
                selected ? style.selectedText : style.text,
                { fontSize: 16 },
              ]}
            >
              {distortion.explanation().join("\n\n")}
            </Text>
            <Bubbles.SelectableThought color={bubble} selected={selected}>
              {distortion.explanationThought()}
            </Bubbles.SelectableThought>
          </>
        ) : (
          distortion.description()
        )
        return (
          <SelectorTextItem
            key={distortion.slug}
            emoji={distortion.emoji()}
            text={distortion.label()}
            description={description}
            selected={selected}
            onPress={() => props.onPress(distortion.slug)}
          />
        )
      })}
    </View>
  )
}
