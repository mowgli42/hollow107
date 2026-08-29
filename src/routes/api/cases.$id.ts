import { createFileRoute } from "@tanstack/react-router";
import { fail, json } from "@/lib/hollow107/http.ts";
import { presentCase } from "@/lib/hollow107/aging.ts";
import {
  canEditEngineerNotes,
  canEditQaNotes,
  canManageHypotheses,
  canPatchTar,
} from "@/lib/hollow107/workflow.ts";
import type { CaseStatus, Hypothesis, Role, Tar107 } from "@/lib/hollow107/schema.ts";
import {
  addHypothesis,
  getCase,
  patchTar,
  setHypothesisStatus,
  setNotes,
  transitionCase,
} from "@/lib/hollow107/store.server.ts";

export const Route = createFileRoute("/api/cases/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rec = await getCase(params.id);
        if (!rec) return fail("Unknown case", 404);
        return json({ ok: true, case: presentCase(rec) });
      },
      POST: async ({ params, request }) => {
        try {
          const body = (await request.json()) as {
            action?: string;
            to?: CaseStatus;
            role?: Role;
            actorName?: string;
            patch?: Partial<Tar107>;
            hypothesis?: { text: string; killCheck: string };
            hypId?: string;
            hypStatus?: Hypothesis["status"];
            notes?: { which: "engineerNotes" | "qaNotes"; value: string };
          };
          const actor = body.actorName ?? body.role ?? "";
          const role = body.role;
          if (!role) return fail("Need role.");
          if (body.action === "transition") {
            if (!body.to) return fail("Need to.");
            const rec = await transitionCase(params.id, body.to, role, actor);
            return json({ ok: true, case: presentCase(rec) });
          }
          if (body.action === "patch") {
            if (!body.patch) return fail("Need patch.");
            const existing = await getCase(params.id);
            if (!existing) return fail("Unknown case", 404);
            if (!canPatchTar(role, existing.status)) return fail("Only FSR can edit triage fields.");
            const rec = await patchTar(params.id, body.patch, actor);
            return json({ ok: true, case: presentCase(rec) });
          }
          if (body.action === "hypothesis") {
            if (!body.hypothesis?.text || !body.hypothesis.killCheck) return fail("Need hypothesis text and killCheck.");
            const existing = await getCase(params.id);
            if (!existing) return fail("Unknown case", 404);
            if (!canManageHypotheses(role, existing.status)) return fail("Only engineers can add hypotheses.");
            const rec = await addHypothesis(params.id, body.hypothesis.text, body.hypothesis.killCheck, actor);
            return json({ ok: true, case: presentCase(rec) });
          }
          if (body.action === "hypothesis-status") {
            if (!body.hypId || !body.hypStatus) return fail("Need hypId and hypStatus.");
            const existing = await getCase(params.id);
            if (!existing) return fail("Unknown case", 404);
            if (!canManageHypotheses(role, existing.status)) return fail("Only engineers can update hypotheses.");
            const rec = await setHypothesisStatus(params.id, body.hypId, body.hypStatus);
            return json({ ok: true, case: presentCase(rec) });
          }
          if (body.action === "notes") {
            if (!body.notes) return fail("Need notes.");
            const existing = await getCase(params.id);
            if (!existing) return fail("Unknown case", 404);
            if (body.notes.which === "engineerNotes" && !canEditEngineerNotes(role)) {
              return fail("Only engineers can edit engineer notes.");
            }
            if (body.notes.which === "qaNotes" && !canEditQaNotes(role, existing.status)) {
              return fail("Only QA can edit QA notes during review.");
            }
            const rec = await setNotes(params.id, body.notes.which, body.notes.value, actor);
            return json({ ok: true, case: presentCase(rec) });
          }
          return fail("Unknown action.");
        } catch (err) {
          return fail(err instanceof Error ? err.message : "Update failed");
        }
      },
    },
  },
});
