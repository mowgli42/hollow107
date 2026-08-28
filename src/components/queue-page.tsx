import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CaseRow, sortQueue, type QueueSort } from "@/components/case-row";
import { KanbanBoard } from "@/components/kanban-board";
import { useOpsCases } from "@/hooks/use-ops";
import { matchesStage, type WorkflowStage } from "@/lib/hollow107";
import type { PresentedCase } from "@/lib/hollow107/aging.ts";
import { useOpsUi } from "@/store/ops";
import { cn } from "@/lib/utils";

const SORTS: { id: QueueSort; label: string }[] = [
  { id: "critical", label: "Critical" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
];

type PageConfig = {
  kicker: string;
  title: string;
  stage: WorkflowStage | "open";
  showKanbanToggle?: boolean;
};

export function QueuePage({
  kicker,
  title,
  stage,
  showKanbanToggle = false,
}: PageConfig) {
  const { data: cases, isLoading } = useOpsCases();
  const [sort, setSort] = useState<QueueSort>("critical");
  const queueView = useOpsUi((s) => s.queueView);
  const setQueueView = useOpsUi((s) => s.setQueueView);

  const filtered = (cases ?? []).filter((c) => matchesStage(c.status, stage));
  const list = sortQueue(filtered, sort);
  const kanban = showKanbanToggle && queueView === "kanban";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">{kicker}</p>
          <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
        </div>
        {showKanbanToggle && (
          <ViewToggle view={queueView} onChange={setQueueView} />
        )}
      </div>

      {!kanban && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs tracking-widest text-fg-subtle uppercase">
            {filtered.length} {filtered.length === 1 ? "ticket" : "tickets"}
          </p>
          <SortToggle sort={sort} onChange={setSort} />
        </div>
      )}

      {isLoading && <p className="text-sm text-fg-muted">Loading cases…</p>}
      {!isLoading && filtered.length === 0 && (
        <EmptyStage stage={stage} />
      )}
      {!isLoading && filtered.length > 0 && kanban && <KanbanBoard cases={filtered} />}
      {!isLoading && filtered.length > 0 && !kanban && (
        <ul className="space-y-3">
          {list.map((c) => (
            <CaseRow key={c.id} rec={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "list" | "kanban";
  onChange: (view: "list" | "kanban") => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Queue view"
      className="inline-flex rounded-md border border-border-strong bg-bg-elevated p-0.5"
    >
      {(["list", "kanban"] as const).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={view === v}
          onClick={() => onChange(v)}
          className={cn(
            "min-h-11 rounded-sm px-3 text-sm font-medium capitalize",
            view === v ? "bg-bg-ink text-fg-invert" : "text-fg-muted hover:text-fg",
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function SortToggle({ sort, onChange }: { sort: QueueSort; onChange: (sort: QueueSort) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Sort queue"
      className="inline-flex rounded-md border border-border-strong bg-bg-elevated p-0.5"
    >
      {SORTS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={sort === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "min-h-11 rounded-sm px-3 text-sm font-medium",
            sort === option.id ? "bg-bg-ink text-fg-invert" : "text-fg-muted hover:text-fg",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function EmptyStage({ stage }: { stage: WorkflowStage | "open" }) {
  const copy: Record<WorkflowStage | "open", string> = {
    open: "No open tickets.",
    triage: "Nothing waiting for triage.",
    engineer: "Engineering queue is clear.",
    qa: "Nothing in QA review.",
    closed: "No closed or rejected tickets yet.",
  };
  return (
    <p className="rounded-md border border-dashed border-border-strong px-4 py-10 text-center text-sm text-fg-muted">
      {copy[stage]}{" "}
      {stage !== "closed" && (
        <>
          <Link to="/ingest" className="text-fg underline-offset-2 hover:underline">
            Ingest XML
          </Link>{" "}
          to add work.
        </>
      )}
    </p>
  );
}

export function filterCases(cases: PresentedCase[], stage: WorkflowStage | "open") {
  return cases.filter((c) => matchesStage(c.status, stage));
}
