import { createFileRoute } from "@tanstack/react-router";
import { fail } from "@/lib/hollow107/http.ts";
import { toResponseXml } from "@/lib/hollow107";
import { getCase } from "@/lib/hollow107/store.server.ts";

export const Route = createFileRoute("/api/cases/$id/response.xml")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rec = await getCase(params.id);
        if (!rec) return fail("Unknown case", 404);
        return new Response(toResponseXml(rec), {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
