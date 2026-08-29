import { workflowSteps } from "@/lib/hollow107";
import type { CaseStatus } from "@/lib/hollow107";
import { cn } from "@/lib/utils";

export function StatusSteps({
  status,
  size = "md",
}: {
  status: CaseStatus;
  size?: "sm" | "md";
}) {
  const steps = workflowSteps(status);
  const compact = size === "sm";

  return (
    <ol
      className={cn("flex flex-wrap items-center", compact ? "gap-1" : "gap-2")}
      aria-label="107 workflow progress"
    >
      {steps.map((step, i) => (
        <li key={step.id} className="flex items-center">
          {i > 0 && (
            <span
              className={cn(
                "mx-1 h-px",
                compact ? "w-2" : "w-4",
                step.state === "pending" ? "bg-border" : "bg-ok/60",
              )}
              aria-hidden
            />
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm border font-mono uppercase tracking-widest",
              compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
              step.state === "done" && "border-ok/40 bg-ok/15 text-ok",
              step.state === "current" && "border-accent/50 bg-accent/15 text-accent",
              step.state === "pending" && "border-border bg-bg-subtle text-fg-subtle",
            )}
            aria-current={step.state === "current" ? "step" : undefined}
          >
            <span
              className={cn(
                "rounded-full",
                compact ? "size-1.5" : "size-2",
                step.state === "done" && "bg-ok",
                step.state === "current" && "bg-accent",
                step.state === "pending" && "bg-fg-subtle",
              )}
              aria-hidden
            />
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
