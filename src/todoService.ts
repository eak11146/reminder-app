import { Todo, TodoInput } from "./types";
import { scheduleFor, cancelNotif } from "./notifications";

// เปลี่ยน IP นี้เป็น IP เครื่องคุณ หรือ URL Render ตอน deploy
//const API_URL = "http://192.168.110.149:5000/api/todos"; 
// ตอนขึ้น Render จะเป็น https://reminder-backend-xxxx.onrender.com/api/todos
const API_URL = "https://reminder-app-backend-3wbx.onrender.com/api/todos";

export const todoService = {
  list: async (): Promise<Todo[]> => {
    const res = await fetch(API_URL);
    const data = await res.json();
    // ตั้งแจ้งเตือนใหม่ทุกครั้งที่โหลดจากคลาวด์
    for (const t of data) {
      if (!t.done) await scheduleFor(t);
    }
    return data.map((t:any)=> ({...t, id: t._id || t.id }));
  },

  create: async (input: TodoInput): Promise<Todo> => {
    const temp: any = { ...input, done: false, notifId: null };
    temp.notifId = await scheduleFor(temp);
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(temp)
    });
    const saved = await res.json();
    return { ...saved, id: saved._id };
  },

  update: async (id: string, patch: any): Promise<Todo> => {
    // ยกเลิกอันเก่า
    const oldListRes = await fetch(API_URL);
    const oldList = await oldListRes.json();
    const old = oldList.find((x:any)=> (x._id||x.id)===id);
    if (old) await cancelNotif(old.notifId);

    const nextTemp = { ...old, ...patch };
    const newNotifId = await scheduleFor(nextTemp);

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...patch, notifId: newNotifId })
    });
    const saved = await res.json();
    return { ...saved, id: saved._id };
  },

  remove: async (id: string) => {
    const oldListRes = await fetch(API_URL);
    const oldList = await oldListRes.json();
    const old = oldList.find((x:any)=> (x._id||x.id)===id);
    if (old) await cancelNotif(old.notifId);
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  }
};