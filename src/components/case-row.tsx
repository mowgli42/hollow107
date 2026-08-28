import { Link } from "@tanstack/react-router";
import { RequestMetrics } from "@/components/request-status";
import { StatusSteps } from "@/components/status-steps";
import { parseTime } from "@/lib/hollow107/aging.ts";
import type { PresentedCase } from "@/lib/hollow107/aging.ts";
import { cn } from "@/lib/utils";

export type QueueSort = "critical" | "newest" | "oldest";

export function CaseRow({ rec }: { rec: PresentedCase }) {
  const untriaged = rec.status === "ingested";
  return (
    <li>
      <Link
        to="/cases/$id"
        params={{ id: rec.id }}
        className={cn(
          "flex flex-col gap-3 rounded-md border bg-bg-elevated p-4 no-underline transition-colors duration-150 hover:border-border-strong",
          untriaged ? "border-accent/50" : "border-border",
        )}
      >
        <div className="flex gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <StatusSteps status={rec.status} size="sm" />
            <h2 className="text-base font-medium tracking-tight text-fg">{rec.title || "Untitled 107"}</h2>
            <p className="w-fit font-mono text-xs text-fg-muted">
              {rec.id} · {rec.tar.requestType || "type?"} · {rec.tar.unit || "no unit"} · {rec.tar.serialNumber || "no SN"} ·{" "}
              {rec.sourceKind} · {rec.lastUpdatedLabel}
            </p>
          </div>
          <RequestMetrics rec={rec} variant="stacked" size="sm" />
        </div>
      </Link>
    </li>
  );
}

const RANK = { critical: 0, high: 1, watch: 2, routine: 3 } as const;

export function sortQueue(cases: PresentedCase[], mode: QueueSort = "critical"): PresentedCase[] {
  return [...cases].sort((a, b) => {
    if (mode === "newest") {
      return parseTime(b.createdAt, 0) - parseTime(a.createdAt, 0);
    }
    if (mode === "oldest") {
      return parseTime(a.createdAt, 0) - parseTime(b.createdAt, 0);
    }
    const aTriage = a.status === "ingested" ? 0 : 1;
    const bTriage = b.status === "ingested" ? 0 : 1;
    if (aTriage !== bTriage) return aTriage - bTriage;
    const cr = RANK[a.criticality] - RANK[b.criticality];
    if (cr) return cr;
    const am = a.unansweredMs ?? -1;
    const bm = b.unansweredMs ?? -1;
    return bm - am;
  });
}
