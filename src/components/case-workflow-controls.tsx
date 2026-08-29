import { roleGuidance, workflowMoves, type PresentedCase, type Role } from "@/lib/hollow107";
import { useCaseMutations } from "@/hooks/use-ops";
import { cn } from "@/lib/utils";

export function CaseWorkflowControls({ rec, role }: { rec: PresentedCase; role: Role }) {
  const mutate = useCaseMutations(rec.id);
  const { forward, backward } = workflowMoves(rec, role);
  const steps = roleGuidance(role, rec.status);

  if (rec.status === "closed" || rec.status === "rejected") {
    return (
      <div className="space-y-2 text-end">
        <p className="font-mono text-xs text-fg-muted">{rec.lastUpdatedLabel}</p>
        <p className="text-sm text-fg-subtle">{steps[0]}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-end gap-3">
      <p className="font-mono text-xs text-fg-muted">{rec.lastUpdatedLabel}</p>
      {(forward.length > 0 || backward.length > 0) && (
        <div className="flex w-full flex-col items-end gap-2">
          {forward.length > 0 && (
            <MoveRow label="Forward" moves={forward} onMove={(to) => mutate.mutate({ action: "transition", to, role })} />
          )}
          {backward.length > 0 && (
            <MoveRow
              label="Back"
              moves={backward}
              muted
              onMove={(to) => mutate.mutate({ action: "transition", to, role })}
            />
          )}
        </div>
      )}
      <ul className="space-y-1 text-end text-xs text-fg-subtle">
        {steps.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function MoveRow({
  label,
  moves,
  muted,
  onMove,
}: {
  label: string;
  moves: { to: PresentedCase["status"]; label: string }[];
  muted?: boolean;
  onMove: (to: PresentedCase["status"]) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="font-mono text-[10px] tracking-widest text-fg-subtle uppercase">{label}</span>
      {moves.map((move) => {
        const danger = move.to === "rejected" || move.to === "closed";
        return (
          <button
            key={move.to}
            type="button"
            onClick={() => onMove(move.to)}
            className={cn(
              "min-h-9 rounded-md px-3 text-xs font-medium",
              danger && !muted
                ? "bg-bg-ink text-fg-invert"
                : muted
                  ? "border border-border bg-bg-subtle text-fg-muted hover:border-border-strong hover:text-fg"
                  : "bg-accent text-accent-fg",
            )}
          >
            {move.label}
          </button>
        );
      })}
    </div>
  );
}
