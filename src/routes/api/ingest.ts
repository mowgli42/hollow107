import { createFileRoute } from "@tanstack/react-router";
import { fail, json, readXmlBody } from "@/lib/hollow107/http.ts";
import { presentCase } from "@/lib/hollow107/aging.ts";
import { saveIngestedCase } from "@/lib/hollow107/store.server.ts";
import { recordImportRun } from "@/lib/hollow107/store.server.ts";
import type { SourceKind } from "@/lib/hollow107/schema.ts";

export const Route = createFileRoute("/api/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const sourceKind = (url.searchParams.get("source") as SourceKind) || "api";
          const teamSlug = url.searchParams.get("team") || "fsr";
          const actorName = url.searchParams.get("actor") || "";
          const { xml, sourceName } = await readXmlBody(request);
          const rec = await saveIngestedCase(xml, sourceName, {
            sourceKind: sourceKind === "folder" ? "folder" : sourceKind === "web" ? "web" : "api",
            teamSlug,
            actorName,
          });
          await recordImportRun({
            sourceKind: rec.sourceKind,
            status: "ok",
            message: `Ingested ${sourceName} · hollowness ${rec.hollowness}% · ${rec.status}`,
            filesOk: 1,
            filesFailed: 0,
            startedAt: rec.createdAt,
            finishedAt: rec.updatedAt,
          });
          return json({ ok: true, case: presentCase(rec) }, 201);
        } catch (err) {
          return fail(err instanceof Error ? err.message : "Ingest failed", 400);
        }
      },
    },
  },
});
