import { useState } from "react";
import { canPatchTar, canManageHypotheses, canEditQaNotes, type CaseRecord, type Role } from "@/lib/hollow107";
import { cn } from "@/lib/utils";
import { useCaseMutations } from "@/hooks/use-ops";

export function CaseResolution({ rec, role }: { rec: CaseRecord; role: Role }) {
  const mutate = useCaseMutations(rec.id);
  const [text, setText] = useState("");
  const [kill, setKill] = useState("");
  const engineerActive = canManageHypotheses(role, rec.status);
  const qaActive = canEditQaNotes(role, rec.status);

  return (
    <div className="space-y-8">
      {role === "engineer" && !engineerActive && (
        <p className="text-sm text-fg-subtle">Engineering actions unlock when this ticket is in the engineer queue.</p>
      )}

      {engineerActive && rec.hollowness > 20 && (
        <p className="rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          Hollowness {rec.hollowness}% — do not diagnose. Send back to FSR for callback.
        </p>
      )}

      {engineerActive && (
        <section className="space-y-4">
          <h3 className="text-xl font-medium tracking-tight">Hypotheses</h3>
          {rec.hypotheses.length === 0 && <p className="text-sm text-fg-subtle">None yet.</p>}
          <ul className="space-y-3">
            {rec.hypotheses.map((h) => (
              <li key={h.id} className="rounded-md border border-border bg-bg-elevated p-4">
                <p className="text-sm font-medium text-fg">{h.text}</p>
                <p className="mt-1 font-mono text-xs text-fg-muted">Kill: {h.killCheck}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["open", "supported", "ruled-out"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => mutate.mutate({ action: "hypothesis-status", hypId: h.id, hypStatus: st })}
                      className={cn(
                        "min-h-11 rounded-md border px-3 text-xs font-medium uppercase tracking-wide",
                        h.status === st
                          ? "border-bg-ink bg-bg-ink text-fg-invert"
                          : "border-border text-fg-muted hover:border-border-strong",
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim() || !kill.trim()) return;
              mutate.mutate({ action: "hypothesis", hypothesis: { text: text.trim(), killCheck: kill.trim() } });
              setText("");
              setKill("");
            }}
          >
            <input
              className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
              placeholder="Hypothesis"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
              placeholder="Kill check"
              value={kill}
              onChange={(e) => setKill(e.target.value)}
            />
            <button type="submit" className="min-h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">
              Add hypothesis
            </button>
          </form>
          <label className="block space-y-2">
            <span className="font-mono text-xs tracking-widest text-accent uppercase">Engineer notes</span>
            <textarea
              rows={4}
              className="w-full rounded-md border border-border-strong bg-bg-elevated px-3 py-2 text-sm"
              defaultValue={rec.engineerNotes}
              onBlur={(e) =>
                mutate.mutate({ action: "notes", notes: { which: "engineerNotes", value: e.target.value } })
              }
            />
          </label>
        </section>
      )}

      {qaActive && (
        <section className="space-y-4">
          <h3 className="text-xl font-medium tracking-tight">QA review</h3>
          {rec.hypotheses.length > 0 && (
            <ul className="space-y-2">
              {rec.hypotheses.map((h) => (
                <li key={h.id} className="text-sm">
                  <span className="font-mono text-xs uppercase tracking-wide text-fg-subtle">{h.status}</span>
                  <span className="ms-2 text-fg">{h.text}</span>
                </li>
              ))}
            </ul>
          )}
          {rec.engineerNotes && (
            <blockquote className="border-l-2 border-accent pl-4 text-sm text-fg-muted">{rec.engineerNotes}</blockquote>
          )}
          <label className="block space-y-2">
            <span className="font-mono text-xs tracking-widest text-accent uppercase">QA notes</span>
            <textarea
              rows={4}
              className="w-full rounded-md border border-border-strong bg-bg-elevated px-3 py-2 text-sm"
              defaultValue={rec.qaNotes}
              onBlur={(e) => mutate.mutate({ action: "notes", notes: { which: "qaNotes", value: e.target.value } })}
            />
          </label>
        </section>
      )}

      {role === "fsr" && canPatchTar(role, rec.status) && rec.status === "ingested" && (
        <p className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-fg">
          Imported but not triaged. Review gaps and hollowness, then complete triage to route the request.
        </p>
      )}

      {role === "fsr" && canPatchTar(role, rec.status) && rec.status !== "ingested" && rec.hollowness > 20 && (
        <p className="text-sm text-fg-muted text-pretty">
          Fill triage gaps first. Send-to-engineer unlocks at 20% hollowness or below.
        </p>
      )}

    </div>
  );
}
