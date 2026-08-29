import { createFileRoute } from "@tanstack/react-router";
import { fail, json } from "@/lib/hollow107/http.ts";
import type { CaseStatus, Role } from "@/lib/hollow107/schema.ts";
import { listTeams, upsertTeam } from "@/lib/hollow107/store.server.ts";

export const Route = createFileRoute("/api/teams")({
  server: {
    handlers: {
      GET: async () => json({ ok: true, teams: await listTeams() }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            slug?: string;
            name?: string;
            role?: Role;
            blurb?: string;
            statuses?: CaseStatus[];
            unitFilter?: string;
          };
          if (!body.slug || !body.name || !body.role || !body.blurb || !body.statuses?.length) {
            return fail("Need slug, name, role, blurb, and statuses[].");
          }
          const team = await upsertTeam({
            slug: body.slug,
            name: body.name,
            role: body.role,
            blurb: body.blurb,
            statuses: body.statuses,
            unitFilter: body.unitFilter,
          });
          return json({ ok: true, team, landing: `/t/${team.slug}`, casesApi: `/api/teams/${team.slug}/cases` }, 201);
        } catch (err) {
          return fail(err instanceof Error ? err.message : "Could not save team display");
        }
      },
    },
  },
});
