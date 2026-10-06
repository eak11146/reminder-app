import { Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { Todo } from "./types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Reminder",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("ต้องเปิดสิทธิ์แจ้งเตือน", "ไปที่ Settings > Apps > Notifications");
  }
}

export async function scheduleFor(t: Todo): Promise<string | null> {
  if (t.done) return null;
  const d = new Date(t.dueAt);
  const content = {
    title: "🔔 " + t.title,
    body: t.description || "ถึงเวลาแล้ว",
    sound: "default" as const,
  };

  let trigger: Notifications.NotificationTriggerInput;
  if (t.repeat === "daily") {
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: d.getHours(),
      minute: d.getMinutes(),
      channelId: "default",
    };
  } else if (t.repeat === "weekly") {
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: d.getDay() + 1, // expo: 1 = อาทิตย์ ... 7 = เสาร์
      hour: d.getHours(),
      minute: d.getMinutes(),
      channelId: "default",
    };
  } else {
    if (d.getTime() <= Date.now()) return null;
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: d,
      channelId: "default",
    };
  }
  return Notifications.scheduleNotificationAsync({ content, trigger });
}

export async function cancelNotif(id: string | null) {
  if (id) await Notifications.cancelScheduledNotificationAsync(id);
}