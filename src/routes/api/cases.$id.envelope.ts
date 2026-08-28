import { createFileRoute } from "@tanstack/react-router";
import { fail, json } from "@/lib/hollow107/http.ts";
import { presentCase } from "@/lib/hollow107/aging.ts";
import { getEnvelope } from "@/lib/hollow107/store.server.ts";

export const Route = createFileRoute("/api/cases/$id/envelope")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const envelope = await getEnvelope(params.id);
        if (!envelope) return fail("Unknown case", 404);
        return json({ ok: true, ...envelope, case: presentCase(envelope.case) });
      },
    },
  },
});
