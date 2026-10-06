import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ScrollView, StyleSheet } from "react-native";
import { Priority, Todo, TodoInput } from "./src/types";
import { ORDER, PAGE_SIZE, PRIORITY_LABEL } from "./src/constants";
import { setupNotifications } from "./src/notifications";
import { todoService } from "./src/todoService";
import TodoCard from "./src/components/TodoCard";
import TodoForm from "./src/components/TodoForm";

type Filter = "all" | Priority;

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);

  useEffect(() => {
    (async () => {
      await setupNotifications();
      setTodos(await todoService.list());
    })();
  }, []);

  // กรอง -> เรียง (ยังไม่เสร็จก่อน, แล้ว priority, แล้ววันที่) -> แบ่งหน้า
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return todos
      .filter((t) => filter === "all" || t.priority === filter)
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          Number(a.done) - Number(b.done) ||
          ORDER[a.priority] - ORDER[b.priority] ||
          new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      );
  }, [todos, search, filter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = visible.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (t: Todo) => { setEditing(t); setFormOpen(true); };

  const save = async (input: TodoInput) => {
    try {
      if (editing) {
        const next = await todoService.update(editing.id, input);
        setTodos((l) => l.map((x) => (x.id === next.id ? next : x)));
      } else {
        const created = await todoService.create(input);
        setTodos((l) => [...l, created]);
      }
      setFormOpen(false);
    } catch (e: any) {
      Alert.alert("บันทึกไม่สำเร็จ", e.message);
    }
  };

  const toggle = async (t: Todo) => {
    const next = await todoService.update(t.id, { done: !t.done });
    setTodos((l) => l.map((x) => (x.id === next.id ? next : x)));
  };

  const remove = (t: Todo) => {
    Alert.alert("ลบรายการ", `ลบ "${t.title}" และยกเลิกการแจ้งเตือน?`, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          await todoService.remove(t.id);
          setTodos((l) => l.filter((x) => x.id !== t.id));
        },
      },
    ]);
  };

  const filters: Filter[] = ["all", "high", "medium", "low"];

  return (
    <View style={s.container}>
      <Text style={s.h1}>Reminder</Text>
      <Text style={s.sub}>{todos.length} รายการ</Text>

      <TextInput
        style={s.search}
        value={search}
        onChangeText={(v) => { setSearch(v); setPage(0); }}
        placeholder="🔍 ค้นหา"
      />

      <View style={s.filters}>
        {filters.map((f) => (
          <Pressable
            key={f}
            onPress={() => { setFilter(f); setPage(0); }}
            style={[s.chip, filter === f && s.chipOn]}
          >
            <Text style={filter === f ? s.chipTxtOn : s.chipTxt}>
              {f === "all" ? "ทั้งหมด" : PRIORITY_LABEL[f]}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }}>
        {pageItems.length === 0 && (
          <Text style={s.empty}>
            {todos.length === 0 ? "ยังไม่มีรายการ กด + เพื่อเพิ่ม" : "ไม่พบรายการที่ตรงเงื่อนไข"}
          </Text>
        )}
        {pageItems.map((t) => (
          <TodoCard
            key={t.id}
            todo={t}
            onToggle={() => toggle(t)}
            onEdit={() => openEdit(t)}
            onDelete={() => remove(t)}
          />
        ))}
      </ScrollView>

      <View style={s.pager}>
        <Pressable
          disabled={currentPage === 0}
          onPress={() => setPage(currentPage - 1)}
          style={[s.pageBtn, currentPage === 0 && s.disabled]}
        >
          <Text style={s.pageTxt}>◀ ก่อนหน้า</Text>
        </Pressable>
        <Text style={s.pageInfo}>{currentPage + 1} / {totalPages}</Text>
        <Pressable
          disabled={currentPage >= totalPages - 1}
          onPress={() => setPage(currentPage + 1)}
          style={[s.pageBtn, currentPage >= totalPages - 1 && s.disabled]}
        >
          <Text style={s.pageTxt}>ถัดไป ▶</Text>
        </Pressable>
      </View>

      <Pressable style={s.fab} onPress={openAdd}>
        <Text style={s.fabTxt}>+</Text>
      </Pressable>

      <TodoForm
        visible={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSave={save}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f5", paddingTop: 56, paddingHorizontal: 16 },
  h1: { fontSize: 28, fontWeight: "900" },
  sub: { color: "#71717a", marginBottom: 12 },
  search: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10 },
  filters: { flexDirection: "row", gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#d4d4d8",
  },
  chipOn: { backgroundColor: "#000", borderColor: "#000" },
  chipTxt: { color: "#000", fontWeight: "700" },
  chipTxtOn: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", color: "#a1a1aa", marginTop: 40 },
  pager: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  pageBtn: { backgroundColor: "#000", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  pageTxt: { color: "#fff", fontWeight: "700" },
  pageInfo: { fontWeight: "700" },
  disabled: { opacity: 0.3 },
  fab: {
    position: "absolute", right: 20, bottom: 80, width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", elevation: 5,
  },
  fabTxt: { color: "#fff", fontSize: 30, marginTop: -2 },
});