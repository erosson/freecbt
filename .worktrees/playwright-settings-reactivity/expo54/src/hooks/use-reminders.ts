import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Action } from "../model";
import { TranslateFn } from "./use-i18n";

export type Reminders = ReturnType<typeof useReminders>;
export function useReminders() {
  return {
    // v1 code's reminder-support check.
    // as of 2025/12, expo-notifications doesn't support web: https://docs.expo.dev/guides/using-push-notifications-services/#tips-and-important-considerations
    // TODO: not sure why android wasn't enabled, but wait til the big v2 release is done to enable it
    isSupported: () => Platform.OS === "ios",
    // isSupported: () => false,
    // isSupported: () => true,
    async enable(dispatch: (a: Action.Action) => void, t: TranslateFn) {
      await enable(t);
      dispatch(Action.setReminders(true));
    },
    async disable(dispatch: (a: Action.Action) => void) {
      await disable();
      dispatch(Action.setReminders(false));
    },
    async set(
      v: boolean,
      dispatch: (a: Action.Action) => void,
      t: TranslateFn
    ) {
      if (v) {
        await this.enable(dispatch, t);
      } else {
        await this.disable(dispatch);
      }
    },
  } as const;
}

async function disable() {
  return await Notifications.cancelAllScheduledNotificationsAsync();
}
async function enable(t: TranslateFn): Promise<boolean> {
  await disable();
  // don't enable without permission
  const enabled = await registerForLocalNotificationsAsync();
  if (enabled) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t("reminder_notification.intro.title"),
        body: t("reminder_notification.intro.body"),
        color: "#F78FB3",
        // icon: "https://freecbt.erosson.org/static/favicon/favicon.ico",
        // icon: "https://freecbt.erosson.org/notifications/quirk-bw.png",
      },
      trigger: null,
    });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t("reminder_notification.1.title"),
        body: t("reminder_notification.1.body"),
        color: "#F78FB3",
        // icon: "https://freecbt.erosson.org/static/favicon/favicon.ico",
        // icon: "https://freecbt.erosson.org/notifications/quirk-bw.png",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: "default",
      },
      // { channelId: "default", repeats: true, seconds: 86400 },
    });
  }
  // setSetting(NOTIFICATIONS_KEY, JSON.stringify(enabled));
  return enabled;
}

async function registerForLocalNotificationsAsync() {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== "granted") {
      return false;
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  return true;
}
