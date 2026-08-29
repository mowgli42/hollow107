import { Link, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Archive, ClipboardList, FilePlus2, Layers, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleSwitch } from "@/components/role-switch";
import { StatusStrip } from "@/components/status-strip";

const NAV = [
  { to: "/" as const, label: "In-work", icon: Layers },
  { to: "/triage" as const, label: "Triage", icon: ClipboardList },
  { to: "/engineer" as const, label: "Engineer", icon: Wrench },
  { to: "/qa" as const, label: "QA", icon: ClipboardList },
  { to: "/closed" as const, label: "Closed", icon: Archive },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="flex items-baseline gap-3 no-underline">
              <span className="font-mono text-xs font-medium tracking-widest text-accent uppercase">Hollow107</span>
              <span className="text-lg font-medium tracking-tight text-fg">TAR queue</span>
            </Link>
            <RoleSwitch />
          </div>
          <nav className="flex items-center gap-2">
            <div className="-mx-4 flex min-w-0 flex-1 gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {NAV.map(({ to, label, icon: Icon }) => {
                const active = pathname === to || (to !== "/" && pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium",
                      active ? "bg-bg-ink text-fg-invert" : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
            </div>
            <Link
              to="/ingest"
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium",
                pathname === "/ingest"
                  ? "bg-bg-ink text-fg-invert"
                  : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
              )}
            >
              <FilePlus2 className="size-4" strokeWidth={1.75} />
              Ingest
            </Link>
          </nav>
        </div>
        <StatusStrip />
      </header>
      <main className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>XML is the request/response. Users, timeline, and logs stay on the envelope.</p>
          <Link to="/about" className="text-fg-muted underline-offset-2 hover:underline">
            Data plan
          </Link>
        </div>
      </footer>
      <Toaster richColors theme="dark" position="bottom-center" />
    </div>
  );
}
