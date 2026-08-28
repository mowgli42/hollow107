import { createFileRoute } from "@tanstack/react-router";
import { fail, json } from "@/lib/hollow107/http.ts";
import { getTeam } from "@/lib/hollow107/store.server.ts";

export const Route = createFileRoute("/api/teams/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const team = await getTeam(params.slug);
        if (!team) return fail("Unknown team display", 404);
        return json({
          ok: true,
          team,
          landing: `/t/${team.slug}`,
          casesApi: `/api/teams/${team.slug}/cases`,
        });
      },
    },
  },
});
