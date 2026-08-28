import { useState } from "react";
import { toast } from "sonner";
import { nextActions, STATUS_LABEL, type CaseRecord, type Role } from "@/lib/hollow107";
import { cn } from "@/lib/utils";
import { useCases } from "@/store/cases";

export function CaseResolution({ rec, role }: { rec: CaseRecord; role: Role }) {
  const move = useCases((s) => s.move);
  const addHypothesis = useCases((s) => s.addHypothesis);
  const setHypothesisStatus = useCases((s) => s.setHypothesisStatus);
  const setNotes = useCases((s) => s.setNotes);
  const [text, setText] = useState("");
  const [kill, setKill] = useState("");
  const actions = nextActions(rec, role);

  function tryMove(to: (typeof actions)[number]["to"]) {
    try {
      move(rec.id, to);
      toast.success(`Moved to ${STATUS_LABEL[to]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cannot move");
    }
  }

  return (
    <div className="space-y-8">
      {role === "engineer" && rec.hollowness > 20 && (
        <p className="rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          Hollowness {rec.hollowness}% — do not diagnose. Switch to FSR and fill the
          callback list, or ask QA to override.
        </p>
      )}

      {role === "engineer" && (
        <section className="space-y-4">
          <h3 className="font-display text-xl font-medium tracking-tight">Hypotheses</h3>
          <p className="text-sm text-fg-muted text-pretty">
            One cause per row, plus the check that would kill it. No Brain Book matching
            in this prototype — that is a production bead.
          </p>
          {rec.hypotheses.length === 0 && (
            <p className="text-sm text-fg-subtle">None yet.</p>
          )}
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
                      onClick={() => setHypothesisStatus(rec.id, h.id, st)}
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
              if (!text.trim() || !kill.trim()) {
                toast.error("Hypothesis and kill-check are both required.");
                return;
              }
              addHypothesis(rec.id, text.trim(), kill.trim());
              setText("");
              setKill("");
            }}
          >
            <input
              className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
              placeholder="Hypothesis — e.g. GPS-1 LNA fails below −15 C"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
              placeholder="Kill check — e.g. swap GPS-1; if GPS-2 path still fails, rule out"
              value={kill}
              onChange={(e) => setKill(e.target.value)}
            />
            <button
              type="submit"
              className="min-h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
            >
              Add hypothesis
            </button>
          </form>
          <label className="block space-y-2">
            <span className="font-mono text-xs tracking-widest text-accent uppercase">
              Engineer notes
            </span>
            <textarea
              rows={4}
              className="w-full rounded-md border border-border-strong bg-bg-elevated px-3 py-2 text-sm"
              value={rec.engineerNotes}
              onChange={(e) => setNotes(rec.id, "engineerNotes", e.target.value)}
            />
          </label>
        </section>
      )}

      {role === "qa" && (
        <section className="space-y-4">
          <h3 className="font-display text-xl font-medium tracking-tight">QA review</h3>
          <p className="text-sm text-fg-muted text-pretty">
            Close only when context is solid. Reject hollow slogans. You may override
            the engineer gate to pull a case forward, but you cannot stamp it closed
            while hollowness is above 20.
          </p>
          {rec.hypotheses.length > 0 && (
            <ul className="space-y-2">
              {rec.hypotheses.map((h) => (
                <li key={h.id} className="text-sm">
                  <span className="font-mono text-xs uppercase tracking-wide text-fg-subtle">
                    {h.status}
                  </span>
                  <span className="ms-2 text-fg">{h.text}</span>
                </li>
              ))}
            </ul>
          )}
          {rec.engineerNotes && (
            <blockquote className="border-l-2 border-accent pl-4 text-sm text-fg-muted">
              {rec.engineerNotes}
            </blockquote>
          )}
          <label className="block space-y-2">
            <span className="font-mono text-xs tracking-widest text-accent uppercase">QA notes</span>
            <textarea
              rows={4}
              className="w-full rounded-md border border-border-strong bg-bg-elevated px-3 py-2 text-sm"
              value={rec.qaNotes}
              onChange={(e) => setNotes(rec.id, "qaNotes", e.target.value)}
            />
          </label>
        </section>
      )}

      {role === "fsr" && rec.hollowness > 20 && (
        <p className="text-sm text-fg-muted text-pretty">
          Fill the triage gaps first. The send-to-engineer action unlocks at 20%
          hollowness or below.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {actions.length === 0 && (
          <p className="text-sm text-fg-subtle">No moves available in this role and status.</p>
        )}
        {actions.map((a) => {
          const danger = a.to === "rejected" || a.to === "closed";
          return (
            <button
              key={a.to}
              type="button"
              onClick={() => tryMove(a.to)}
              className={cn(
                "min-h-11 rounded-md px-4 text-sm font-medium",
                danger ? "bg-bg-ink text-fg-invert" : "bg-accent text-accent-fg",
              )}
            >
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
