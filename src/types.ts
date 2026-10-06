export type Priority = "high" | "medium" | "low";
export type Repeat = "once" | "daily" | "weekly";

export type Todo = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueAt: string; // ISO
  repeat: Repeat;
  done: boolean;
  notifId: string | null;
};

export type TodoInput = Omit<Todo, "id" | "notifId" | "done">;