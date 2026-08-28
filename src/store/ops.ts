import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/hollow107";

export type ActivityState = "idle" | "working" | "ok" | "error";

export type Activity = {
  state: ActivityState;
  message: string;
};

type Store = {
  role: Role;
  setRole: (role: Role) => void;
  queueView: "list" | "kanban";
  setQueueView: (view: "list" | "kanban") => void;
  activity: Activity;
  setActivity: (activity: Activity) => void;
};

export const useOpsUi = create<Store>()(
  persist(
    (set) => ({
      role: "fsr",
      setRole: (role) => set({ role }),
      queueView: "list",
      setQueueView: (queueView) => set({ queueView }),
      activity: { state: "idle", message: "Ready" },
      setActivity: (activity) => set({ activity }),
    }),
    { name: "hollow107-ops", partialize: (s) => ({ role: s.role, queueView: s.queueView }) },
  ),
);
