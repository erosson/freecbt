import { LoadModel, ModelLoadedProps } from "@/src/hooks/use-model";
import { Style } from "@/src/hooks/use-style";
import { AppProvider } from "@/src/view/app-provider";
import { Feather } from "@expo/vector-icons";
import { DrawerNavigationOptions } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Platform, useWindowDimensions } from "react-native";

export default function Layout() {
  return (
    <AppProvider>
      {/* <Stack screenOptions={{ headerShown: false }} /> */}
      {/* <Drawer /> */}
      {/* <Nav /> */}
      <LoadModel ready={Nav} />
    </AppProvider>
  );
}

function Nav({ style: s, translate: t }: ModelLoadedProps) {
  return (
    <Drawer screenOptions={useDrawerOptions(s)}>
      <Drawer.Screen
        name="thoughts/create"
        options={{
          drawerLabel: t("accessibility.new_thought_button"),
          drawerIcon: () => <Feather style={s.text} name="message-circle" />,
          title: t("cbt_form.header"),
        }}
      />
      <Drawer.Screen {...hidden("index", t("cbt_form.header"))} />
      <Drawer.Screen
        name="thoughts/index"
        options={{
          drawerLabel: t("accessibility.list_button"),
          drawerIcon: () => <Feather style={s.text} name="list" />,
          title: t("cbt_list.header"),
        }}
      />
      <Drawer.Screen
        name="settings/export"
        options={{
          drawerLabel: t("nav.export"),
          drawerIcon: () => <Feather style={s.text} name="share-2" />,
          title: t("export_screen.header"),
        }}
      />
      <Drawer.Screen
        name="settings/backup"
        options={{
          drawerLabel: t("nav.backup"),
          drawerIcon: () => <Feather style={s.text} name="save" />,
          title: t("backup_screen.header"),
        }}
      />
      <Drawer.Screen
        name="settings/index"
        options={{
          drawerLabel: t("accessibility.settings_button"),
          drawerIcon: () => <Feather style={s.text} name="settings" />,
          title: t("settings.header"),
        }}
      />
      <Drawer.Screen
        name="help/index"
        options={{
          drawerLabel: t("accessibility.help_button"),
          drawerIcon: () => <Feather style={s.text} name="help-circle" />,
          title: t("explanation_screen.header"),
        }}
      />
      {/* TODO it'd be nice to include 'the freecbt guide' link here. but the drawer nav component here makes it quite hard to do external links */}

      {/* hidden screens must be listed here, otherwise they get an ugly default entry */}
      <Drawer.Screen
        {...hidden("help/intro", t("explanation_screen.intro"), {
          // no nav: the intro has a nice style designed without nav
          headerShown: false,
        })}
      />
      <Drawer.Screen
        {...hidden("settings/lock", t("settings.pincode.button.set"), {
          // no nav, for now: set vs. update page titles are different
          // (easy to fix if we split into two pages, though? or make this title dynamic?)
          headerShown: false,
        })}
      />
      <Drawer.Screen
        {...hidden("thoughts/[idOrKey]/edit", t("cbt_form.header"))}
      />
      <Drawer.Screen
        {...hidden("thoughts/[idOrKey]/index", t("cbt_form.header"))}
      />
    </Drawer>
  );
}
export function useDrawerOptions(s: Style): DrawerNavigationOptions {
  // https://docs.expo.dev/router/advanced/drawer/
  // https://reactnavigation.org/docs/drawer-navigator
  const dim = useWindowDimensions();
  const isLargeScreen = Platform.OS === "web" && dim.width > 1024;
  return {
    headerStyle: {
      backgroundColor: s.bg.backgroundColor,
      borderBottomColor: s.border.borderColor,
    },
    // isLargeScreen hides the drawer-open button on large screens.
    // hacky as hell, but I can't find a better way...!
    headerTintColor: isLargeScreen ? s.bg.backgroundColor : s.header.color,
    headerTitleStyle: {
      color: s.header.color,
      fontSize: s.header.fontSize,
      fontWeight: s.header.fontWeight,
    },
    drawerStyle: {
      backgroundColor: s.bg.backgroundColor,
      borderWidth: s.border.borderWidth,
      borderColor: s.border.borderColor,
      borderRightColor: s.border.borderColor, // used only on large-screen web
      borderLeftWidth: 0,
    },
    drawerLabelStyle: { color: s.text.color },
    drawerActiveTintColor: s.bgSelected.backgroundColor,
    drawerInactiveTintColor: s.text.color,
    drawerType: isLargeScreen ? "permanent" : undefined,
  };
}
function hidden(
  name: string,
  title: string,
  options: Parameters<typeof Drawer.Screen>[0]["options"] = {}
) {
  return {
    name,
    options: {
      ...options,
      title,
      // the only recommended way to hide routes that I found -
      // so it's still rendered in the list, just hidden. ugh.
      // https://github.com/expo/router/discussions/916
      drawerItemStyle: { display: "none" },
    },
  } as const;
}
