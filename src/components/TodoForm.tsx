import { useEffect, useState } from "react";
import {
  Modal, ScrollView, View, Text, TextInput, Pressable, Alert, StyleSheet,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Priority, Repeat, Todo, TodoInput } from "../types";
import { COLOR, PRIORITY_LABEL, REPEAT_LABEL, fmt } from "../constants";

type Props = {
  visible: boolean;
  editing: Todo | null;
  onClose: () => void;
  onSave: (input: TodoInput) => Promise<void> | void;
};

export default function TodoForm({ visible, editing, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueAt, setDueAt] = useState(new Date());
  const [repeat, setRepeat] = useState<Repeat>("once");

  // รีเซ็ตค่าทุกครั้งที่เปิดฟอร์ม
  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description);
      setPriority(editing.priority);
      setDueAt(new Date(editing.dueAt));
      setRepeat(editing.repeat);
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueAt(new Date(Date.now() + 60 * 1000));
      setRepeat("once");
    }
  }, [visible, editing]);

  const pickDateTime = () => {
    DateTimePickerAndroid.open({
      value: dueAt,
      mode: "date",
      onChange: (e, date) => {
        if (e.type !== "set" || !date) return;
        DateTimePickerAndroid.open({
          value: date,
          mode: "time",
          is24Hour: true,
          onChange: (e2, time) => {
            if (e2.type !== "set" || !time) return;
            const merged = new Date(date);
            merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setDueAt(merged);
          },
        });
      },
    });
  };

  const submit = async () => {
    if (!title.trim()) return Alert.alert("กรุณาใส่ชื่อ");
    if (repeat === "once" && dueAt.getTime() <= Date.now()) {
      return Alert.alert(
        "เวลาผ่านไปแล้ว",
        "เลือกเวลาในอนาคต หรือเปลี่ยนเป็นแจ้งเตือนทุกวัน/ทุกสัปดาห์"
      );
    }
    await onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueAt: dueAt.toISOString(),
      repeat,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
        <Text style={s.h1}>{editing ? "แก้ไขรายการ" : "เพิ่มรายการ"}</Text>

        <Text style={s.label}>ชื่อ</Text>
        <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="เช่น กินยา" />

        <Text style={s.label}>รายละเอียด</Text>
        <TextInput
          style={[s.input, { height: 80, textAlignVertical: "top" }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="รายละเอียดเพิ่มเติม"
        />

        <Text style={s.label}>วันที่และเวลา</Text>
        <Pressable style={s.input} onPress={pickDateTime}>
          <Text>📅 {fmt(dueAt.toISOString())}</Text>
        </Pressable>

        <Text style={s.label}>ความสำคัญ</Text>
        <View style={s.row}>
          {(["high", "medium", "low"] as Priority[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[s.chip, priority === p && { backgroundColor: COLOR[p], borderColor: COLOR[p] }]}
            >
              <Text style={priority === p ? s.chipOn : s.chipOff}>{PRIORITY_LABEL[p]}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.label}>การแจ้งเตือน</Text>
        <View style={s.row}>
          {(["once", "daily", "weekly"] as Repeat[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRepeat(r)}
              style={[s.chip, repeat === r && s.chipActive]}
            >
              <Text style={repeat === r ? s.chipOn : s.chipOff}>{REPEAT_LABEL[r]}</Text>
            </Pressable>
          ))}
        </View>
        {repeat !== "once" && (
          <Text style={s.hint}>
            {repeat === "daily"
              ? "เตือนทุกวันตามเวลาที่เลือก จนกว่าจะลบรายการ"
              : "เตือนทุกสัปดาห์ในวันและเวลาที่เลือก จนกว่าจะลบรายการ"}
          </Text>
        )}

        <View style={[s.row, { marginTop: 24 }]}>
          <Pressable style={[s.btn, { backgroundColor: "#999" }]} onPress={onClose}>
            <Text style={s.btnTxt}>ยกเลิก</Text>
          </Pressable>
          <Pressable style={[s.btn, { backgroundColor: "#000" }]} onPress={submit}>
            <Text style={s.btnTxt}>บันทึก</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}

const s = StyleSheet.create({
  form: { padding: 20, paddingTop: 56 },
  h1: { fontSize: 28, fontWeight: "900" },
  label: { fontWeight: "700", marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: "#f4f4f5", borderRadius: 12, padding: 12 },
  row: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    borderWidth: 1, borderColor: "#d4d4d8",
  },
  chipActive: { backgroundColor: "#000", borderColor: "#000" },
  chipOn: { color: "#fff", fontWeight: "700" },
  chipOff: { color: "#000", fontWeight: "700" },
  hint: { color: "#71717a", marginTop: 8, fontSize: 12 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
  btnTxt: { color: "#fff", fontWeight: "700" },
});