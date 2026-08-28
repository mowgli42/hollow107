import { describeBand, hollownessBand } from "@/lib/hollow107";
import { cn } from "@/lib/utils";

export function HollownessMeter({
  score,
  gaps,
  size = "md",
}: {
  score: number;
  gaps: number;
  size?: "sm" | "md" | "lg";
}) {
  const band = hollownessBand(score);
  const slots = 12;
  const missing = Math.round((score / 100) * slots);
  const filled = 12 - gaps;

  return (
    <div className={cn("flex items-center gap-4", size === "lg" && "gap-6")}>
      <div
        className={cn(
          "flex items-start tabular-nums font-display font-medium leading-none tracking-tight",
          size === "lg" && "text-6xl sm:text-7xl",
          size === "md" && "text-4xl",
          size === "sm" && "text-2xl",
          band === "hollow" && "text-warn",
          band === "thin" && "text-accent",
          band === "solid" && "text-ok",
        )}
      >
        {score}
        <span className="mt-1 ms-1 font-sans text-sm font-medium tracking-wide">%</span>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-medium",
            size === "lg" ? "text-base" : "text-sm",
            band === "hollow" && "text-warn",
            band === "thin" && "text-accent",
            band === "solid" && "text-ok",
          )}
        >
          {describeBand(score)}
        </p>
        <p className="mt-1 font-mono text-xs tracking-wide text-fg-muted uppercase">
          {gaps} gap{gaps === 1 ? "" : "s"} · {filled}/12 fields
        </p>
        <div className="mt-2 flex gap-1" aria-hidden>
          {Array.from({ length: slots }, (_, i) => (
            <span
              key={i}
              className={cn("h-2 flex-1 rounded-xs", i < missing ? "bg-warn/80" : "bg-ok/70")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
