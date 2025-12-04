import { Routes } from "@/src";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { ImagePath } from "@/src/view";
import { Link } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return <LoadModel ready={Ready} />;
}
function Ready(props: ModelLoadedProps) {
  const { model, style: s, translate: t } = props;
  const img = (i: number) => ImagePath.bubbles[i % ImagePath.bubbles.length];
  return (
    <ScrollView style={[s.view]}>
      <SafeAreaView style={[s.view]}>
        <View style={[s.flexCol, s.container]}>
          <View style={[s.flexRow]}>
            <Link
              style={[s.flex1, s.border, s.rounded, s.p2, s.button]}
              target="_blank"
              href="https://freecbt.erosson.org/explanation/?ref=quirk"
            >
              <TouchableOpacity style={[s.flex1]}>
                <Text style={[s.buttonText]}>
                  {t("onboarding_screen.header")}
                </Text>
              </TouchableOpacity>
            </Link>
            <Link
              style={[
                s.flex1,
                s.border,
                s.rounded,
                s.p2,
                s.bg,
                s.textCenter,
                s.p3,
              ]}
              href={Routes.introV2()}
            >
              <TouchableOpacity style={[s.flex1]}>
                <Text style={[s.text]}>{t("explanation_screen.intro")}</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {model.distortionData.list.map((d, i) => (
            <View key={d.slug} style={[s.my2]}>
              <Text style={[s.subheader]}>{t(d.labelKey)}</Text>
              {/* <Text style={[s.text]}>{t(d.descriptionKey)}</Text> */}
              <Text style={[s.text]}>
                {d.explanationKeys.map((tk) => t(tk)).join("\n\n")}
              </Text>

              <View style={[s.flexRow, s.my2]}>
                <Image source={img(i)} style={[s.bubble, s.m2]} />
                <Text style={[s.text, s.bgCard, s.border, s.rounded, s.p2]}>
                  {" "}
                  {t(d.explanationThoughtKey)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
