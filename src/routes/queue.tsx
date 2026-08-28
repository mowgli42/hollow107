import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { HollownessMeter } from "@/components/hollowness-meter";
import { hollownessBand, STATUS_LABEL } from "@/lib/hollow107";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCases } from "@/store/cases";

export const Route = createFileRoute("/queue")({ component: Queue });

function Queue() {
  const ready = useHydrated();
  const cases = useCases((s) => s.cases);
  const loadSamples = useCases((s) => s.loadSamples);
  const clear = useCases((s) => s.clear);

  if (!ready) {
    return <p className="text-sm text-fg-muted">Loading queue…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">Work queue</p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-balance">Cases</h1>
          <p className="max-w-xl text-fg-muted text-pretty">
            Sorted by how empty they are. Hollow first — that is the work, not the diagnosis.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              loadSamples();
              toast.success("Loaded teaching set");
            }}
            className="min-h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Load teaching set
          </button>
          <button
            type="button"
            onClick={() => {
              clear();
              toast.success("Queue cleared");
            }}
            className="min-h-11 rounded-md border border-border-strong px-4 text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {cases.length === 0 && (
        <div className="rounded-lg border border-dashed border-border-strong px-6 py-16 text-center">
          <p className="font-display text-2xl font-medium">Queue is empty.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted text-pretty">
            Ingest a 107 on the home page, or load the three teaching cases — ghost, thin, and solid.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-bg-ink px-4 text-sm font-medium text-fg-invert"
          >
            Go ingest
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {[...cases]
          .sort((a, b) => b.hollowness - a.hollowness)
          .map((c) => {
            const band = hollownessBand(c.hollowness);
            return (
              <li key={c.id}>
                <Link
                  to="/cases/$id"
                  params={{ id: c.id }}
                  className="block rounded-lg border border-border bg-bg-elevated p-5 shadow-panel no-underline transition-colors duration-150 hover:border-border-strong"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs tracking-widest text-fg-subtle uppercase">
                          {c.sourceName}
                        </span>
                        <span
                          className={cn(
                            "rounded-xs px-2 py-0.5 font-mono text-xs uppercase tracking-wide",
                            band === "hollow" && "bg-warn/15 text-warn",
                            band === "thin" && "bg-accent/10 text-accent",
                            band === "solid" && "bg-ok/15 text-ok",
                          )}
                        >
                          {band}
                        </span>
                        <span className="rounded-xs bg-bg-subtle px-2 py-0.5 font-mono text-xs uppercase tracking-wide text-fg-muted">
                          {STATUS_LABEL[c.status]}
                        </span>
                      </div>
                      <h2 className="font-display text-xl font-medium tracking-tight text-fg text-balance">
                        {c.title || "Untitled 107"}
                      </h2>
                      <p className="text-sm text-fg-muted">
                        {c.tar.requestType || "type?"} · {c.tar.unit || "no unit"} ·{" "}
                        {c.tar.serialNumber || "no SN"}
                      </p>
                    </div>
                    <div className="w-full sm:w-64">
                      <HollownessMeter score={c.hollowness} gaps={c.gaps.length} size="sm" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
