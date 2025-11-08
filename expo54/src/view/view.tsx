import { Feather } from "@expo/vector-icons";
import { Href, Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { ModelLoadedProps } from "../hooks/use-model";

export type FeatherIconName = keyof typeof Feather.glyphMap;
export function LinkButton(
  props: Pick<ModelLoadedProps, "style"> & {
    href: Href;
    icon?: FeatherIconName;
    label: string;
  }
) {
  const { style: s } = props;
  return (
    <TouchableOpacity style={[s.flex1, s.border, s.rounded, s.p2]}>
      <Link style={[s.flex1]} href={props.href}>
        <Text style={[s.text]}>
          {props.icon ? (
            <>
              <Feather name={props.icon} accessibilityLabel={props.label} />{" "}
            </>
          ) : null}
          {props.label}
        </Text>
      </Link>
    </TouchableOpacity>
  );
}
