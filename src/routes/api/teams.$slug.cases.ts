import { createFileRoute } from "@tanstack/react-router";
import { fail, json } from "@/lib/hollow107/http.ts";
import { presentCase } from "@/lib/hollow107/aging.ts";
import { getTeam, listCases } from "@/lib/hollow107/store.server.ts";

export const Route = createFileRoute("/api/teams/$slug/cases")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const team = await getTeam(params.slug);
        if (!team) return fail("Unknown team display", 404);
        const cases = await listCases({
          statuses: team.statuses,
          unit: team.unitFilter || undefined,
        });
        return json({
          ok: true,
          team,
          cases: cases.map((c) => presentCase(c)),
        });
      },
    },
  },
});
