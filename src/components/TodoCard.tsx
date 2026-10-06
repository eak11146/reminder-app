import { View, Text, Pressable, StyleSheet } from "react-native";
import { Todo } from "../types";
import { COLOR, PRIORITY_LABEL, REPEAT_LABEL, fmt } from "../constants";

type Props = {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TodoCard({ todo, onToggle, onEdit, onDelete }: Props) {
  return (
    <View
      style={[
        s.card,
        { borderLeftColor: COLOR[todo.priority] },
        todo.done && { opacity: 0.5 },
      ]}
    >
      <Pressable onPress={onToggle} style={[s.check, todo.done && s.checkOn]}>
        {todo.done && <Text style={s.tick}>✓</Text>}
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={[s.title, todo.done && s.strike]}>{todo.title}</Text>
        {!!todo.description && <Text style={s.desc}>{todo.description}</Text>}
        <Text style={s.meta}>
          📅 {fmt(todo.dueAt)} · 🔁 {REPEAT_LABEL[todo.repeat]} · {PRIORITY_LABEL[todo.priority]}
        </Text>
      </View>

      <View style={s.actions}>
        <Pressable onPress={onEdit}>
          <Text style={s.edit}>แก้ไข</Text>
        </Pressable>
        <Pressable onPress={onDelete}>
          <Text style={s.del}>ลบ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 5,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#d4d4d8",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  tick: { color: "#fff", fontWeight: "900" },
  title: { fontWeight: "700", fontSize: 16 },
  strike: { textDecorationLine: "line-through" },
  desc: { color: "#52525b", marginTop: 2 },
  meta: { color: "#71717a", fontSize: 12, marginTop: 6 },
  actions: { alignItems: "flex-end", gap: 12, paddingLeft: 8 },
  edit: { color: "#2563eb", fontWeight: "700" },
  del: { color: "#ef4444", fontWeight: "700" },
});