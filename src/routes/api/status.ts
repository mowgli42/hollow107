import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/hollow107/http.ts";
import { presentCase } from "@/lib/hollow107/aging.ts";
import { latestImportRun, listCases, queueSnapshot } from "@/lib/hollow107/store.server.ts";

export const Route = createFileRoute("/api/status")({
  server: {
    handlers: {
      GET: async () => {
        const [queue, lastImport, cases] = await Promise.all([
          queueSnapshot(),
          latestImportRun(),
          listCases(),
        ]);
        const now = Date.now();
        const open = cases.filter((c) => c.status !== "closed" && c.status !== "rejected");
        const presented = open.map((c) => presentCase(c, now));
        const critical = presented.filter((c) => c.criticality === "critical").length;
        const oldest = presented[0];
        return json({
          ok: true,
          state: lastImport?.status === "running" ? "importing" : "idle",
          lastImport,
          queue,
          critical,
          oldestUnanswered: oldest
            ? { id: oldest.id, title: oldest.title, unansweredLabel: oldest.unansweredLabel }
            : null,
        });
      },
    },
  },
});
