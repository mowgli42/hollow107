import { ROLE_LABEL, type Role } from "@/lib/hollow107";
import { cn } from "@/lib/utils";
import { useCases } from "@/store/cases";

const ROLES: Role[] = ["fsr", "engineer", "qa"];

export function RoleSwitch() {
  const role = useCases((s) => s.role);
  const setRole = useCases((s) => s.setRole);

  return (
    <div
      role="radiogroup"
      aria-label="Active role"
      className="inline-flex rounded-md border border-border-strong bg-bg-elevated p-0.5"
    >
      {ROLES.map((r) => {
        const active = role === r;
        return (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setRole(r)}
            className={cn(
              "min-h-11 min-w-20 rounded-sm px-3 text-sm font-medium transition-colors duration-150",
              active ? "bg-bg-ink text-fg-invert" : "text-fg-muted hover:text-fg",
            )}
          >
            {ROLE_LABEL[r]}
          </button>
        );
      })}
    </div>
  );
}
