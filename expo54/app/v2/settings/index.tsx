import { Routes } from "@/src";
import { LocaleTag, localeTags, TranslateFn } from "@/src/hooks/use-i18n";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { useStyle, useTheme } from "@/src/hooks/use-style";
import { Action, Model, Settings } from "@/src/model";
import { LinkButton } from "@/src/view/view";
import { Picker } from "@react-native-picker/picker";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return <LoadModel ready={Ready} />;
}
function Ready({ model, dispatch, translate: t }: ModelLoadedProps) {
  const s = usePageStyle(Model.colorScheme(model));
  return (
    <View style={[s.view]}>
      <View style={[s.flexRow, s.justifyBetween, s.container]}>
        <Text style={[s.header]}>{t("settings.header")}</Text>
        <View>
          <View style={[s.flexCol]}>
            <LinkButton
              style={s}
              href={Routes.thoughtListV2()}
              label={t("accessibility.list_button")}
              icon="list"
            />
          </View>
        </View>
      </View>

      <View style={[s.container]}>
        <ThemeForm
          value={model.settings.theme}
          dispatch={dispatch}
          s={s}
          t={t}
        />
        <LockUpdateForm
          dispatch={dispatch}
          isSet={!!model.settings.pincode}
          s={s}
          t={t}
        />
        <HistoryForm
          value={model.settings.historyLabels}
          dispatch={dispatch}
          s={s}
          t={t}
        />

        <Text style={[s.subheader]}>{t("settings.backup.header")}</Text>
        <Link
          style={[s.btn, s.flex1, { fontWeight: "normal" }]}
          href={Routes.backupV2()}
        >
          <TouchableOpacity style={[s.flex1]}>
            <Text style={[s.buttonText]}>{t("settings.backup.button")}</Text>
          </TouchableOpacity>
        </Link>
        <Link
          style={[s.btn, s.flex1, { fontWeight: "normal" }]}
          href={Routes.exportV2()}
        >
          <TouchableOpacity style={[s.flex1]}>
            <Text style={[s.buttonText]}>
              {t("settings.backup.export-button")}
            </Text>
          </TouchableOpacity>
        </Link>

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
    </View>
  );
}

function ThemeForm(props: {
  value: Settings.Settings["theme"];
  dispatch: (a: Action.Action) => void;
  s: PageStyle;
  t: TranslateFn;
}) {
  const { value, dispatch, s, t } = props;
  return (
    <>
      <Text style={[s.subheader]}>{t("settings.theme.header")}</Text>
      <SelectorButtons<Settings.Settings["theme"]>
        style={s}
        selected={value}
        options={[
          [null, t("settings.theme.default")],
          ["light", t("settings.theme.light")],
          ["dark", t("settings.theme.dark")],
        ]}
        onPress={(v) => dispatch(Action.setTheme(v))}
      />
    </>
  );
}
function LockUpdateForm(props: {
  dispatch: (a: Action.Action) => void;
  isSet: boolean;
  s: PageStyle;
  t: TranslateFn;
}) {
  const { dispatch, isSet, s, t } = props;
  return (
    <>
      <Text style={[s.subheader]}>{t("settings.pincode.header")}</Text>
      <Text style={[s.text]}>{t("settings.pincode.description")}</Text>
      {isSet ? (
        <>
          <Link
            style={[s.btn, s.flex1, { fontWeight: "normal" }]}
            href={Routes.lockUpdateV2()}
          >
            <TouchableOpacity style={[s.flex1]}>
              <Text style={[s.buttonText]}>
                {t("settings.pincode.button.update")}
              </Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={[s.btn]}
            onPress={() => dispatch(Action.setPincode(null))}
          >
            <Text style={[s.buttonText]}>
              {t("settings.pincode.button.clear")}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Link
          style={[s.btn, s.flex1, { fontWeight: "normal" }]}
          href={Routes.lockUpdateV2()}
        >
          <TouchableOpacity style={[s.flex1]}>
            <Text style={[s.buttonText]}>
              {t("settings.pincode.button.set")}
            </Text>
          </TouchableOpacity>
        </Link>
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
  return (
    <>
      <Text style={[s.subheader]}>{t("settings.history.header")}</Text>
      <Text style={[s.text]}>{t("settings.history.description")}</Text>
      <SelectorButtons<Settings.Settings["historyLabels"]>
        style={s}
        selected={value}
        options={[
          ["alternative-thought", t("settings.history.button.alternative")],
          ["automatic-thought", t("settings.history.button.automatic")],
        ]}
        onPress={(v) => dispatch(Action.setHistoryLabel(v))}
      />
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
  const options: readonly Pair<LocaleTag | "", string>[] = [
    ["", t("settings.locale.default")],
    ...localeTags
      .filter((locale) => !locale.startsWith("_"))
      // since translation-keys and locales are both static, these constructed translation-keys are still typesafe! amazing!
      .map((locale) => [locale, t(`settings.locale.list.${locale}`)] as const),
  ];
  return (
    <>
      <Text style={[s.subheader]}>{t("settings.locale.header")}</Text>
      <Picker<LocaleTag | "">
        style={[s.rounded, s.btn, s.buttonText]}
        selectedValue={value ?? ""}
        onValueChange={(value) =>
          dispatch(Action.setLocale(value ? value : null))
        }
      >
        {options.map(([value, label]) => (
          <Picker.Item
            style={[s.buttonText]}
            color={s.buttonText.color}
            key={value}
            label={label}
            value={value}
          />
        ))}
      </Picker>
    </>
  );
}

type Pair<A, B> = readonly [A, B];
function SelectorButtons<V extends string | null>(props: {
  style: PageStyle;
  selected: V;
  options: readonly Pair<V, string>[];
  onPress: (v: V) => void;
}) {
  const { style: s, selected, options, onPress } = props;
  const selectorBtn = (v: V) =>
    selected === v ? s.selectorBtnSelected : s.selectorBtn;
  const selectorText = (v: V) => (selected === v ? s.selectedText : s.text);
  return (
    <View style={[s.flexRow, s.my2]}>
      {options.map(([v, label]) => (
        <TouchableOpacity
          key={v}
          style={[selectorBtn(v), s.flex1]}
          onPress={() => onPress(v)}
        >
          <Text style={[selectorText(v)]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
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
