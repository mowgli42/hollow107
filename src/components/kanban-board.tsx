import { Link } from "@tanstack/react-router";
import { CRITICALITY_LABEL } from "@/lib/hollow107";
import type { PresentedCase } from "@/lib/hollow107/aging.ts";
import { STAGE_STATUSES, type WorkflowStage } from "@/lib/hollow107";
import { cn } from "@/lib/utils";

const CRIT_CLASS: Record<PresentedCase["criticality"], string> = {
  critical: "bg-crit/20 text-crit border-crit/40",
  high: "bg-high/20 text-high border-high/40",
  watch: "bg-warn/20 text-warn border-warn/40",
  routine: "bg-bg-subtle text-fg-muted border-border",
};

const COLUMNS: { stage: WorkflowStage; label: string }[] = [
  { stage: "triage", label: "Triage" },
  { stage: "engineer", label: "Engineer" },
  { stage: "qa", label: "QA" },
];

export function KanbanBoard({ cases }: { cases: PresentedCase[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {COLUMNS.map(({ stage, label }) => {
        const column = cases.filter((c) =>
          (STAGE_STATUSES[stage] as readonly string[]).includes(c.status),
        );
        return (
          <section key={stage} className="flex min-h-48 flex-col rounded-md border border-border bg-bg-subtle">
            <header className="flex items-center justify-between border-b border-border px-3 py-2">
              <h2 className="font-mono text-[10px] tracking-widest text-fg-subtle uppercase">{label}</h2>
              <span className="font-mono text-xs tabular-nums text-fg-muted">{column.length}</span>
            </header>
            <ul className="flex flex-1 flex-col gap-2 p-2">
              {column.length === 0 && (
                <li className="px-2 py-6 text-center text-xs text-fg-subtle">Nothing here</li>
              )}
              {column.map((rec) => (
                <li key={rec.id}>
                  <Link
                    to="/cases/$id"
                    params={{ id: rec.id }}
                    className="block rounded-md border border-border bg-bg-elevated p-3 no-underline transition-colors hover:border-border-strong"
                  >
                    <p className="text-sm font-medium text-fg">{rec.title || "Untitled 107"}</p>
                    <span
                      className={cn(
                        "mt-1.5 inline-flex rounded-sm border px-1.5 py-0.5 font-mono text-[9px] tracking-widest uppercase",
                        CRIT_CLASS[rec.criticality],
                      )}
                    >
                      {CRITICALITY_LABEL[rec.criticality]}
                    </span>
                    <p className="mt-1.5 font-mono text-[10px] text-fg-muted">
                      {rec.id} · {rec.hollowness}% hollow
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
