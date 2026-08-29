import { createFileRoute } from "@tanstack/react-router";
import { fail, json } from "@/lib/hollow107/http.ts";
import { folderImportAvailable, importInboxFolder } from "@/lib/hollow107/folder-import.server.ts";

export const Route = createFileRoute("/api/import/folder")({
  server: {
    handlers: {
      POST: async () => {
        if (!folderImportAvailable()) {
          return fail("Folder import is local-only. POST XML to /api/ingest.", 501);
        }
        try {
          const result = await importInboxFolder();
          return json({ ok: true, ...result });
        } catch (err) {
          return fail(err instanceof Error ? err.message : "Folder import failed", 500);
        }
      },
    },
  },
});
