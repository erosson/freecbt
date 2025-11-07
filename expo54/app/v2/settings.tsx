import { LocaleTag, localeTags, TranslateFn } from "@/src/hooks/use-i18n";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { useStyle, useTheme } from "@/src/hooks/use-style";
import { Action, Model, Settings } from "@/src/model";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return <LoadModel ready={Ready} />;
}
function Ready({ model, dispatch, translate: t }: ModelLoadedProps) {
  const s = usePageStyle(Model.colorScheme(model));
  return (
    <View style={[s.view]}>
      <Text style={[s.header]}>{t("settings.header")}</Text>

      <PincodeForm isSet={!!model.settings.pincode} s={s} t={t} />
      <HistoryForm
        value={model.settings.historyLabels}
        dispatch={dispatch}
        s={s}
        t={t}
      />

      <Text style={[s.subheader]}>{t("settings.backup.header")}</Text>
      <TouchableOpacity style={[s.btn]}>
        <Text style={[s.buttonText]}>{t("settings.backup.button")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.btn]}>
        <Text style={[s.buttonText]}>{t("settings.backup.export-button")}</Text>
      </TouchableOpacity>

      <LocaleForm
        value={model.settings.locale}
        dispatch={dispatch}
        s={s}
        t={t}
      />

      <TouchableOpacity style={[s.btn, s.mt4]}>
        <Text style={[s.buttonText]}>{t("settings.locale.contribute")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.btn]}>
        <Text style={[s.buttonText]}>{t("settings.terms")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.btn]}>
        <Text style={[s.buttonText]}>{t("settings.privacy")}</Text>
      </TouchableOpacity>

      <DebugLink />
    </View>
  );
}

function PincodeForm(props: { isSet: boolean; s: PageStyle; t: TranslateFn }) {
  const { isSet, s, t } = props;
  return (
    <>
      <Text style={[s.subheader]}>{t("settings.pincode.header")}</Text>
      <Text style={[s.text]}>{t("settings.pincode.description")}</Text>
      {isSet ? (
        <>
          <TouchableOpacity style={[s.btn]}>
            <Text style={[s.buttonText]}>
              {t("settings.pincode.button.update")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn]}>
            <Text style={[s.buttonText]}>
              {t("settings.pincode.button.clear")}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={[s.btn]}>
          <Text style={[s.buttonText]}>{t("settings.pincode.button.set")}</Text>
        </TouchableOpacity>
      )}
    </>
  );
}
function HistoryForm(props: {
  value: Settings.HistoryLabel;
  dispatch: Action.Dispatch;
  s: PageStyle;
  t: TranslateFn;
}) {
  const { value, dispatch, s, t } = props;
  const selectorBtn = (selected: boolean) =>
    selected ? s.selectorBtnSelected : s.selectorBtn;
  return (
    <>
      <Text style={[s.subheader]}>{t("settings.history.header")}</Text>
      <Text style={[s.text]}>{t("settings.history.description")}</Text>
      <TouchableOpacity
        style={[selectorBtn(value === "alternative-thought")]}
        onPress={() => dispatch(Action.setHistoryLabel("alternative-thought"))}
      >
        <Text style={[s.text]}>{t("settings.history.button.alternative")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[selectorBtn(value === "automatic-thought")]}
        onPress={() => dispatch(Action.setHistoryLabel("automatic-thought"))}
      >
        <Text style={[s.text]}>{t("settings.history.button.automatic")}</Text>
      </TouchableOpacity>
    </>
  );
}
function LocaleForm(props: {
  value: LocaleTag | null;
  dispatch: Action.Dispatch;
  s: PageStyle;
  t: TranslateFn;
}) {
  const { value, dispatch, s, t } = props;
  return (
    <>
      <Text style={[s.subheader]}>{t("settings.locale.header")}</Text>
      <Picker
        selectedValue={value ?? ""}
        onValueChange={(value) =>
          dispatch(Action.setLocale(value ? (value as LocaleTag) : null))
        }
      >
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
    </>
  );
}

function DebugLink() {
  // TODO
  return <></>;
}

function usePageStyle(cs: Model.ColorScheme) {
  const c = useTheme(cs);
  const s = useStyle(cs);
  return StyleSheet.create({
    ...s,
    subheader: { ...s.subheader, ...s.mt4 },
    btn: { ...s.button, ...s.my1 },
    selectorBtn: {
      ...s.button,
      backgroundColor: c.background,
      borderColor: c.border,
      borderWidth: 1,
    },
    selectorBtnSelected: {
      ...s.button,
      backgroundColor: c.selectedBackground,
      borderColor: c.border,
      borderWidth: 1,
    },
  });
}
type PageStyle = ReturnType<typeof usePageStyle>;
