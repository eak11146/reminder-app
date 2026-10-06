import { Priority, Repeat } from "./types";

export const PAGE_SIZE = 5;
export const ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
export const COLOR: Record<Priority, string> = {
  high: "#ef4444",
  medium: "#eab308",
  low: "#22c55e",
};
export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "สูง",
  medium: "กลาง",
  low: "ต่ำ",
};
export const REPEAT_LABEL: Record<Repeat, string> = {
  once: "ครั้งเดียว",
  daily: "ทุกวัน",
  weekly: "ทุกสัปดาห์",
};

export const fmt = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });