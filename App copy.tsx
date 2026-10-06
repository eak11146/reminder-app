import { useEffect, useState } from "react";
import { View, Text, Button, ScrollView, Platform, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [log, setLog] = useState<string[]>([]);
  const add = (m: string) =>
    setLog((l) => [`${new Date().toLocaleTimeString()}  ${m}`, ...l]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Reminder",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
        add("สร้าง channel แล้ว");
      }
      const { status } = await Notifications.requestPermissionsAsync();
      add("สิทธิ์: " + status);
    })();

    // เด้งตอนแอปเปิดอยู่
    const sub1 = Notifications.addNotificationReceivedListener((n) =>
      add("ได้รับ: " + n.request.content.title)
    );
    // ตอนกดที่ notification
    const sub2 = Notifications.addNotificationResponseReceivedListener((r) =>
      add("ถูกกด: " + r.notification.request.content.title)
    );
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  const schedule = async (seconds: number, title: string) => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body: `ตั้งไว้ ${seconds} วินาที` },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          channelId: "default",
        },
      });
      add(`ตั้งแล้ว id=${id.slice(0, 6)} (${seconds}s)`);
    } catch (e: any) {
      add("ERROR: " + e.message);
    }
  };

  const listScheduled = async () => {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    add(`รอเด้งอยู่ ${all.length} อัน`);
  };

  const cancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    add("ยกเลิกทั้งหมดแล้ว");
  };

  return (
    <View style={s.container}>
      <Text style={s.h1}>Notification Test</Text>
      <View style={s.btns}>
        <Button title="1) เด้งใน 2 วินาที (แอปเปิดอยู่)" onPress={() => schedule(2, "ทดสอบ foreground")} />
        <Button title="2) เด้งใน 10 วินาที (กด Home ออกไปรอ)" onPress={() => schedule(10, "ทดสอบ background")} />
        <Button title="3) เด้งใน 30 วินาที (ล็อกหน้าจอรอ)" onPress={() => schedule(30, "ทดสอบ lock screen")} />
        <Button title="ดูรายการที่ตั้งไว้" onPress={listScheduled} />
        <Button title="ยกเลิกทั้งหมด" color="red" onPress={cancelAll} />
      </View>
      <ScrollView style={s.log}>
        {log.map((l, i) => (
          <Text key={i} style={s.logText}>{l}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  h1: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  btns: { gap: 8 },
  log: { marginTop: 16, backgroundColor: "#eee", padding: 8, borderRadius: 8 },
  logText: { fontSize: 12, marginBottom: 2 },
});