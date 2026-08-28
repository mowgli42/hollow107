import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/lib/hollow107/http.ts";
import { loadSampleCases } from "@/lib/hollow107/samples.server.ts";
import { presentCase } from "@/lib/hollow107/aging.ts";
import { clearCases } from "@/lib/hollow107/store.server.ts";

export const Route = createFileRoute("/api/samples")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("reset") === "1") {
          await clearCases();
        }
        const cases = await loadSampleCases();
        return json({ ok: true, cases: cases.map((c) => presentCase(c)) });
      },
    },
  },
});
