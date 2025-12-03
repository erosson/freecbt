import { Routes } from "@/src";
import { LocaleTag, localeTags, TranslateFn } from "@/src/hooks/use-i18n";
import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { useReminders } from "@/src/hooks/use-reminders";
import { useStyle, useTheme } from "@/src/hooks/use-style";
import { Action, Model, Settings } from "@/src/model";
import { Picker } from "@react-native-picker/picker";
import Constants from "expo-constants";
import { Href, Link } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return <LoadModel ready={Ready} />;
}
function Ready({ model, dispatch, translate: t }: ModelLoadedProps) {
  const s = usePageStyle(Model.colorScheme(model));
  return (
    <SafeAreaView style={[s.view]}>
      <View style={[s.container]}>
        <ThemeForm
          value={model.settings.theme}
          dispatch={dispatch}
          s={s}
          t={t}
        />
        <RemindersForm
          value={model.settings.reminders}
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

        <LocaleForm
          value={model.settings.locale}
          dispatch={dispatch}
          s={s}
          t={t}
        />

        <LinkButton
          style={s}
          href={contributeUrl}
          label={t("settings.locale.contribute")}
        />
        <LinkButton style={s} href={termsUrl} label={t("settings.terms")} />
        <LinkButton style={s} href={privacyUrl} label={t("settings.privacy")} />

        <DebugLink style={s} translate={t} />
      </View>
    </SafeAreaView>
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
function RemindersForm(props: {
  value: boolean;
  dispatch: (a: Action.Action) => void;
  s: PageStyle;
  t: TranslateFn;
}) {
  const { value, dispatch, s, t } = props;
  const reminders = useReminders();
  return reminders.isSupported() ? (
    <>
      <Text style={[s.subheader]}>{t("settings.reminders.header")}</Text>
      <Text style={[s.text]}>{t("settings.reminders.description")}</Text>
      <SelectorButtons<null | "1">
        style={s}
        selected={value ? "1" : null}
        options={[
          ["1", t("settings.reminders.button.yes")],
          [null, t("settings.reminders.button.no")],
        ]}
        onPress={(v) => dispatch(Action.setReminders(!!v))}
      />
    </>
  ) : (
    <></>
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
          <LinkButton
            style={s}
            href={Routes.lockUpdateV2()}
            label={t("settings.pincode.button.update")}
          />
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
        <LinkButton
          style={s}
          href={Routes.lockUpdateV2()}
          label={t("settings.pincode.button.set")}
        />
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
        style={[s.rounded, s.btn, s.buttonText, s.mb4]}
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

function DebugLink(props: { style: PageStyle; translate: TranslateFn }) {
  const { style: s, translate: t } = props;
  const v = Constants.expoConfig?.version;
  const [presses, setPresses] = useState(0);
  const isVisible = presses > 0 && presses % 5 === 0;
  return (
    <>
      <Pressable
        style={{ cursor: "auto" }}
        onPress={() => setPresses(presses + 1)}
      >
        <Text style={[s.text, s.my2]}>
          {v ? `${t("cbt_form.header")} v${v}` : "(unknown FreeCBT version)"}
        </Text>
      </Pressable>
      {isVisible ? (
        <Link style={[s.my4]} href={Routes.debugV2()}>
          <Text style={[s.text, s.underline]}>developer debug page</Text>
        </Link>
      ) : null}
    </>
  );
}

function LinkButton(props: { style: PageStyle; href: Href; label: string }) {
  const { style: s } = props;
  return (
    <Link style={[s.btn, s.flex1, { fontWeight: "normal" }]} href={props.href}>
      <TouchableOpacity style={[s.flex1]}>
        <Text style={[s.buttonText]}>{props.label}</Text>
      </TouchableOpacity>
    </Link>
  );
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

const contributeUrl =
  "https://github.com/erosson/freecbt/blob/master/TRANSLATIONS.md";
const privacyUrl = "https://github.com/erosson/freecbt/blob/master/PRIVACY.md";
const termsUrl = "https://github.com/erosson/freecbt/blob/master/TOS.md";
