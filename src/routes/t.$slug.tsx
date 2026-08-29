import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CaseRow, sortQueue } from "@/components/case-row";
import { useTeamQueue } from "@/hooks/use-ops";
import { useOpsUi } from "@/store/ops";

export const Route = createFileRoute("/t/$slug")({ component: TeamLanding });

function TeamLanding() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useTeamQueue(slug);
  const setRole = useOpsUi((s) => s.setRole);

  useEffect(() => {
    if (data?.team.role) setRole(data.team.role);
  }, [data?.team.role, setRole]);

  if (error) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-medium">Unknown team display</h1>
        <p className="text-sm text-fg-muted">{error instanceof Error ? error.message : "Not found"}</p>
        <p className="text-sm text-fg-muted">
          Create one with <code className="font-mono">POST /api/teams</code>.
        </p>
      </div>
    );
  }

  const team = data?.team;
  const list = sortQueue(data?.cases ?? []);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Team landing · {slug}</p>
        <h1 className="text-3xl font-medium tracking-tight">{team?.name ?? slug}</h1>
        <p className="max-w-2xl text-sm text-fg-muted">{team?.blurb}</p>
        <p className="font-mono text-xs text-fg-subtle">
          API{" "}
          <a href={`/api/teams/${slug}/cases`} className="underline-offset-2 hover:underline">
            {`/api/teams/${slug}/cases`}
          </a>
          {" · "}
          viewing as {team?.role}
        </p>
      </div>
      {isLoading && <p className="text-sm text-fg-muted">Loading {slug} queue…</p>}
      {!isLoading && list.length === 0 && (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-10 text-center text-sm text-fg-muted">
          Nothing in this view. Other teams may still have work.
        </p>
      )}
      <ul className="space-y-3">
        {list.map((c) => (
          <CaseRow key={c.id} rec={c} />
        ))}
      </ul>
    </div>
  );
}
