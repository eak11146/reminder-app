import AsyncStorage from "@react-native-async-storage/async-storage";
import { Todo, TodoInput } from "./types";
import { scheduleFor, cancelNotif } from "./notifications";

const KEY = "todos-v1";

async function readAll(): Promise<Todo[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}
async function writeAll(list: Todo[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export const todoService = {
  list: readAll,

  async create(input: TodoInput): Promise<Todo> {
    const todo: Todo = {
      ...input,
      id: Date.now().toString(),
      done: false,
      notifId: null,
    };
    todo.notifId = await scheduleFor(todo);
    await writeAll([...(await readAll()), todo]);
    return todo;
  },

  async update(id: string, patch: Partial<TodoInput> & { done?: boolean }): Promise<Todo> {
    const list = await readAll();
    const old = list.find((x) => x.id === id);
    if (!old) throw new Error("ไม่พบรายการ");
    await cancelNotif(old.notifId);
    const next: Todo = { ...old, ...patch };
    next.notifId = await scheduleFor(next);
    await writeAll(list.map((x) => (x.id === id ? next : x)));
    return next;
  },

  async remove(id: string) {
    const list = await readAll();
    const old = list.find((x) => x.id === id);
    if (old) await cancelNotif(old.notifId);
    await writeAll(list.filter((x) => x.id !== id));
  },
};