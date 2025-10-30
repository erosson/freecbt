import { localeTags, useTranslate } from "@/src/hooks/use-i18n";
import { useStyle } from "@/src/hooks/use-style";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const s = useStyle();
  const t = useTranslate();

  const subheader = [s.subheader, s.mt4];
  const btn = [s.button, s.my1];
  return (
    <View style={[s.view]}>
      <Text style={[s.header]}>{t("settings.header")}</Text>
      <Text style={subheader}>{t("settings.pincode.header")}</Text>
      <Text style={[s.text]}>{t("settings.pincode.description")}</Text>
      <TouchableOpacity style={btn}>
        <Text style={[s.buttonText]}>{t("settings.pincode.button.set")}</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={[s.button]}> */}
      {/* <Text style={[s.buttonText]}> */}
      {/* {t("settings.pincode.button.update")} */}
      {/* </Text> */}
      {/* </TouchableOpacity> */}
      {/* <TouchableOpacity style={[s.button]}> */}
      {/* <Text style={[s.buttonText]}>{t("settings.pincode.button.clear")}</Text> */}
      {/* </TouchableOpacity> */}

      <Text style={subheader}>{t("settings.history.header")}</Text>
      <Text style={[s.text]}>{t("settings.history.description")}</Text>
      <TouchableOpacity style={btn}>
        <Text style={[s.buttonText]}>
          {t("settings.history.button.alternative")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={btn}>
        <Text style={[s.buttonText]}>
          {t("settings.history.button.automatic")}
        </Text>
      </TouchableOpacity>

      <Text style={subheader}>{t("settings.backup.header")}</Text>
      <TouchableOpacity style={btn}>
        <Text style={[s.buttonText]}>{t("settings.backup.button")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={btn}>
        <Text style={[s.buttonText]}>{t("settings.backup.export-button")}</Text>
      </TouchableOpacity>

      <Text style={subheader}>{t("settings.locale.header")}</Text>
      <Picker>
        <Picker.Item label={t("settings.locale.default")} value={""} />
        {localeTags
          .filter((locale) => !locale.startsWith("_"))
          .map((locale) => (
            <Picker.Item
              key={locale}
              // since translation-keys and locales are both static, these constructed translation-keys are still typesafe! amazing!
              label={t(`settings.locale.list.${locale}`)}
              value={locale}
            />
          ))}
      </Picker>

      <TouchableOpacity style={[...btn, s.mt4]}>
        <Text style={[s.buttonText]}>{t("settings.locale.contribute")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={btn}>
        <Text style={[s.buttonText]}>{t("settings.terms")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={btn}>
        <Text style={[s.buttonText]}>{t("settings.privacy")}</Text>
      </TouchableOpacity>
    </View>
  );
}
