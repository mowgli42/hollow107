import { Link } from "@tanstack/react-router";
import { useOpsStatus } from "@/hooks/use-ops";
import { useOpsUi } from "@/store/ops";
import { cn } from "@/lib/utils";

export function StatusStrip() {
  const activity = useOpsUi((s) => s.activity);
  const { data } = useOpsStatus();
  const last = data?.lastImport?.message;
  const system =
    activity.state === "working"
      ? activity.message
      : activity.state === "error"
        ? activity.message
        : last || activity.message;
  const tone: "idle" | "working" | "ok" | "error" =
    activity.state === "working" || activity.state === "error" || activity.state === "ok"
      ? activity.state
      : "idle";

  return (
    <div
      className="border-b border-border bg-bg-elevated"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="min-w-0">
          <span
            className={cn(
              "me-2 inline-block size-2 rounded-full align-middle",
              tone === "working" && "bg-accent",
              tone === "ok" && "bg-ok",
              tone === "error" && "bg-crit",
              tone === "idle" && "bg-fg-subtle",
            )}
            aria-hidden
          />
          <span className="font-mono tracking-widest text-fg-subtle uppercase">
            {tone === "working" ? "Working" : tone === "error" ? "Error" : tone === "ok" ? "Updated" : "Idle"}
          </span>
          <span className="ms-2 text-fg">{system}</span>
        </p>
        <p className="text-fg-muted">
          {data ? (
            <>
              Open {data.queue.open}
              {data.queue.needsTriage > 0 && (
                <>
                  <span className="mx-2 text-fg-subtle">·</span>
                  <span className="text-warn">Triage {data.queue.needsTriage}</span>
                </>
              )}
              <span className="mx-2 text-fg-subtle">·</span>
              <span className={data.critical ? "text-crit" : undefined}>Critical {data.critical}</span>
              {data.oldestUnanswered && (
                <>
                  <span className="mx-2 text-fg-subtle">·</span>
                  Oldest{" "}
                  <Link
                    to="/cases/$id"
                    params={{ id: data.oldestUnanswered.id }}
                    className="text-fg underline-offset-2 hover:underline"
                  >
                    {data.oldestUnanswered.unansweredLabel}
                  </Link>
                </>
              )}
            </>
          ) : (
            "Loading queue…"
          )}
        </p>
      </div>
    </div>
  );
}
