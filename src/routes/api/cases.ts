import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/hollow107/http.ts";
import { presentCase } from "@/lib/hollow107/aging.ts";
import { listCases } from "@/lib/hollow107/store.server.ts";
import type { CaseStatus } from "@/lib/hollow107/schema.ts";

export const Route = createFileRoute("/api/cases")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get("status");
        const unit = url.searchParams.get("unit") ?? undefined;
        const statuses = status ? (status.split(",") as CaseStatus[]) : undefined;
        const cases = await listCases({ statuses, unit });
        return json({ ok: true, cases: cases.map((c) => presentCase(c)) });
      },
    },
  },
});
