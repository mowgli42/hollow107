import { createFileRoute, Link } from "@tanstack/react-router";
import { CaseRow, sortQueue } from "@/components/case-row";
import { useOpsCases } from "@/hooks/use-ops";

export const Route = createFileRoute("/queue")({ component: QueueRedirect });

function QueueRedirect() {
  const { data, isLoading } = useOpsCases();
  const list = sortQueue(data ?? []);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium tracking-tight">Queue</h1>
        <p className="text-sm text-fg-muted">
          Same list as home. Team slices live under <Link to="/t/$slug" params={{ slug: "fsr" }}>/t/fsr</Link>.
        </p>
      </div>
      {isLoading && <p className="text-sm text-fg-muted">Loading…</p>}
      <ul className="space-y-3">
        {list.map((c) => (
          <CaseRow key={c.id} rec={c} />
        ))}
      </ul>
    </div>
  );
}
