import { CRITICALITY_LABEL, hollownessBand } from "@/lib/hollow107";
import type { PresentedCase } from "@/lib/hollow107/aging.ts";
import { StatusSteps } from "@/components/status-steps";
import { cn } from "@/lib/utils";

const CRIT_CLASS: Record<PresentedCase["criticality"], string> = {
  critical: "bg-crit/20 text-crit border-crit/40",
  high: "bg-high/20 text-high border-high/40",
  watch: "bg-warn/20 text-warn border-warn/40",
  routine: "bg-bg-subtle text-fg-muted border-border",
};

export function RequestStatus({ rec, size = "md" }: { rec: PresentedCase; size?: "sm" | "md" }) {
  return (
    <div className={cn("space-y-2", size === "sm" && "space-y-1.5")} role="group" aria-label="Request status">
      <StatusSteps status={rec.status} size={size} />
      <RequestMetrics rec={rec} variant="inline" size={size} />
    </div>
  );
}

export function RequestMetrics({
  rec,
  variant = "inline",
  size = "md",
}: {
  rec: PresentedCase;
  variant?: "inline" | "stacked";
  size?: "sm" | "md";
}) {
  const band = hollownessBand(rec.hollowness);
  const gap = size === "sm" ? "gap-1.5" : "gap-2";

  const criticalityChip = (
    <StatusChip
      label="Criticality"
      value={CRITICALITY_LABEL[rec.criticality]}
      className={CRIT_CLASS[rec.criticality]}
      stacked={variant === "stacked"}
    />
  );
  const hollownessChip = (
    <StatusChip
      label="Hollowness"
      value={`${band} ${rec.hollowness}%`}
      className={
        band === "hollow"
          ? "bg-warn/15 text-warn border-warn/30"
          : band === "thin"
            ? "bg-accent/15 text-accent border-accent/30"
            : "bg-ok/15 text-ok border-ok/30"
      }
      stacked={variant === "stacked"}
    />
  );
  const waitChip = (
    <StatusChip
      label="Wait"
      value={rec.unansweredLabel}
      className={
        rec.criticality === "critical"
          ? "bg-crit/20 text-crit border-crit/40"
          : rec.unansweredMs != null && rec.unansweredMs > 24 * 3600_000
            ? "bg-warn/20 text-warn border-warn/40"
            : undefined
      }
      stacked={variant === "stacked"}
    />
  );
  const updatedChip = (
    <StatusChip
      label="Last update"
      value={rec.lastUpdatedLabel.replace(/^Updated /, "")}
      stacked={variant === "stacked"}
    />
  );

  if (variant === "stacked") {
    return (
      <div
        className="flex w-44 shrink-0 flex-col items-end self-stretch"
        role="group"
        aria-label="Request metrics"
      >
        <div className={cn("flex flex-col items-end", gap)}>
          {criticalityChip}
          {hollownessChip}
          {waitChip}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center", gap)} role="group" aria-label="Request metrics">
      {criticalityChip}
      {waitChip}
      {hollownessChip}
      {updatedChip}
    </div>
  );
}

function StatusChip({
  label,
  value,
  className,
  stacked,
}: {
  label: string;
  value: string;
  className?: string;
  stacked?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-sm border border-border bg-bg-subtle px-2 py-1",
        stacked && "w-full justify-end text-right",
        className,
      )}
    >
      <span className="font-mono text-[10px] tracking-widest text-fg-subtle uppercase">{label}</span>
      <span className="text-xs font-medium tracking-wide">{value}</span>
    </span>
  );
}
