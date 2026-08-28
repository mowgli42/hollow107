import { Link, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { FilePlus2, Inbox, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleSwitch } from "@/components/role-switch";

const NAV = [
  { to: "/", label: "Ingest", icon: FilePlus2 },
  { to: "/queue", label: "Queue", icon: Inbox },
  { to: "/about", label: "About", icon: Info },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 47px, color-mix(in oklab, var(--color-fg) 4%, transparent) 48px)",
        }}
      />
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="flex items-baseline gap-3 no-underline">
              <span className="font-mono text-xs font-medium tracking-widest text-accent uppercase">
                Hollow107
              </span>
              <span className="font-display text-lg font-medium tracking-tight text-fg">
                Field 107 triage
              </span>
            </Link>
            <RoleSwitch />
          </div>
          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
            {NAV.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-bg-ink text-fg-invert"
                      : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Prototype. Invented TAR XML. Not a technical order. Not an airworthy disposition.</p>
          <p className="font-mono tracking-wide uppercase">See how empty a field 107 really is</p>
        </div>
      </footer>
      <Toaster richColors position="bottom-center" />
    </div>
  );
}
