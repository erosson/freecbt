import React from "react";
import { Text, View, ViewStyle } from "react-native";
import * as Style from "../style";
import theme from "../theme";
import { Paragraph, ThoughtDook } from "../ui";

const PurpleBubble = () => (
  <ThoughtDook
    style={{ marginRight: 8, marginLeft: 4, width: 24, height: 24 }}
    source={require("@/assets/purple/Dook.png")}
  />
);

const YellowBubble = () => (
  <ThoughtDook
    style={{ marginRight: 8, marginLeft: 4, width: 24, height: 24 }}
    source={require("@/assets/yellow/Dook.png")}
  />
);

const PinkBubble = () => (
  <ThoughtDook
    style={{ marginRight: 8, marginLeft: 4, width: 24, height: 24 }}
    source={require("@/assets/pink/Dook.png")}
  />
);

const bubbles = {
  yellow: <YellowBubble />,
  purple: <PurpleBubble />,
  pink: <PinkBubble />,
};
export type Color = keyof typeof bubbles;
export const colors = Object.keys(bubbles) as Color[];

export const BubbleThought = ({
  children,
  color = "yellow",
  style,
}: {
  children: any;
  color?: Color;
  style?: any;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 12,
        paddingRight: 48,
        ...style,
      }}
    >
      {bubbles[color]}
      <View
        style={{
          backgroundColor: theme.offwhite,
          borderRadius: 8,
          padding: 8,
        }}
      >
        <Paragraph>{children}</Paragraph>
      </View>
    </View>
  );
};

export const SelectableThought = (props: {
  children: React.ReactNode;
  color: Color;
  selected?: boolean;
  style?: ViewStyle;
}) => {
  const style = Style.useStyle();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          marginTop: 12,
          paddingRight: 48,
        },
        props.style,
      ]}
    >
      {bubbles[props.color]}
      <View
        style={[
          props.selected ? style.selectedCard : style.card,
          { padding: 8 },
        ]}
      >
        <Text
          style={props.selected ? style.selectedParagraph : style.paragraph}
        >
          {props.children}
        </Text>
      </View>
    </View>
  );
};
