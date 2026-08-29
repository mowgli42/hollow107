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
  showSearch?: boolean;
};

export function QueuePage({
  kicker,
  title,
  stage,
  showKanbanToggle = false,
  showSearch = false,
}: PageConfig) {
  const { data: cases, isLoading } = useOpsCases();
  const [sort, setSort] = useState<QueueSort>("critical");
  const [query, setQuery] = useState("");
  const queueView = useOpsUi((s) => s.queueView);
  const setQueueView = useOpsUi((s) => s.setQueueView);

  const staged = (cases ?? []).filter((c) => matchesStage(c.status, stage));
  const filtered = query.trim() ? staged.filter((c) => matchesSearch(c, query)) : staged;
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

      {showSearch && (
        <label className="block">
          <span className="sr-only">Search tickets</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search id, title, unit, POC, SN…"
            className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
          />
        </label>
      )}

      {!kanban && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs tracking-widest text-fg-subtle uppercase">
            {filtered.length} {filtered.length === 1 ? "ticket" : "tickets"}
            {query.trim() && staged.length !== filtered.length ? ` · ${staged.length} total` : ""}
          </p>
          <SortToggle sort={sort} onChange={setSort} />
        </div>
      )}

      {isLoading && <p className="text-sm text-fg-muted">Loading cases…</p>}
      {!isLoading && staged.length === 0 && <EmptyStage stage={stage} />}
      {!isLoading && staged.length > 0 && filtered.length === 0 && (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-10 text-center text-sm text-fg-muted">
          No tickets match &ldquo;{query.trim()}&rdquo;.
        </p>
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

export function matchesSearch(rec: PresentedCase, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    rec.id,
    rec.title,
    rec.status,
    rec.sourceName,
    rec.sourceKind,
    rec.tar.unit,
    rec.tar.site,
    rec.tar.pocName,
    rec.tar.pocContact,
    rec.tar.mds,
    rec.tar.partNumber,
    rec.tar.serialNumber,
    rec.tar.description,
    rec.tar.requestType,
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((term) => haystack.includes(term));
}
