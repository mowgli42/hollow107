import { createFileRoute, Link } from "@tanstack/react-router";
import { CaseResolution } from "@/components/case-resolution";
import { GapFill } from "@/components/gap-fill";
import { HollownessMeter } from "@/components/hollowness-meter";
import { ROLE_LABEL, STATUS_LABEL, type CaseRecord } from "@/lib/hollow107";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCases } from "@/store/cases";

export const Route = createFileRoute("/cases/$id")({ component: CasePage });

function CasePage() {
  const { id } = Route.useParams();
  const ready = useHydrated();
  const rec = useCases((s) => s.cases.find((c) => c.id === id));
  const role = useCases((s) => s.role);

  if (!ready) {
    return <p className="text-sm text-fg-muted">Loading case…</p>;
  }

  if (!rec) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-medium">Case not in this browser</h1>
        <p className="text-pretty text-fg-muted">
          Cases live in local storage for this prototype. Load the teaching set or ingest XML again.
        </p>
        <Link to="/queue" className="inline-flex min-h-11 items-center text-sm font-medium underline">
          Back to queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">
            {rec.sourceName} · {STATUS_LABEL[rec.status]} · viewing as {ROLE_LABEL[role]}
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            {rec.title || "Untitled 107"}
          </h1>
          <p className="text-sm text-fg-muted">
            {rec.tar.requestType || "—"} · {rec.tar.priority || "priority?"} · {rec.tar.mds || rec.tar.partNumber || "unidentified"}
          </p>
        </div>
        <div className="w-full rounded-lg border border-border bg-bg-elevated p-5 shadow-panel lg:max-w-sm">
          <HollownessMeter score={rec.hollowness} gaps={rec.gaps.length} size="md" />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-medium tracking-tight">Triage</h2>
          {rec.gaps.length > 0 && (
            <ul className="space-y-2">
              {rec.gaps.map((g) => (
                <li key={g.field} className="border-b border-border py-2">
                  <p className="text-sm font-medium text-fg">{g.label}</p>
                  <p className="text-sm text-fg-muted">{g.why}</p>
                </li>
              ))}
            </ul>
          )}
          {role === "fsr" ? <GapFill rec={rec} /> : <TarSummary rec={rec} />}
        </section>
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-medium tracking-tight">Resolution</h2>
          <CaseResolution rec={rec} role={role} />
          {rec.tar.logAttached && (
            <div className="rounded-md border border-border bg-bg-subtle p-4">
              <p className="font-mono text-xs tracking-widest text-fg-subtle uppercase">Attached log excerpt</p>
              <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-fg">
                {SOLID_LOG}
              </pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TarSummary({ rec }: { rec: CaseRecord }) {
  const rows: [string, string][] = [
    ["Unit / site", [rec.tar.unit, rec.tar.site].filter(Boolean).join(" · ") || "—"],
    ["POC", [rec.tar.pocName, rec.tar.pocContact].filter(Boolean).join(" · ") || "—"],
    ["Identity", [rec.tar.mds, rec.tar.partNumber, rec.tar.serialNumber].filter(Boolean).join(" · ") || "—"],
    ["OFP / ICD", [rec.tar.ofp, rec.tar.icd].filter(Boolean).join(" / ") || "—"],
    ["First seen", rec.tar.firstSeen || "—"],
    ["Last known good", rec.tar.lastKnownGood || "—"],
    ["Already tried", rec.tar.alreadyTried || "—"],
    ["Mission impact", rec.tar.missionImpact || "—"],
    ["Evidence", rec.tar.logAttached ? "Log attached" : rec.tar.noLogReason || "None"],
  ];
  return (
    <dl className="space-y-3">
      {rows.map(([k, v]) => (
        <div key={k} className="space-y-1">
          <dt className="font-mono text-xs tracking-wide text-fg-subtle uppercase">{k}</dt>
          <dd className="text-pretty text-sm text-fg">{v}</dd>
        </div>
      ))}
      <div className="space-y-1">
        <dt className="font-mono text-xs tracking-wide text-fg-subtle uppercase">Description</dt>
        <dd className="text-sm leading-relaxed text-pretty">{rec.tar.description || "—"}</dd>
      </div>
    </dl>
  );
}

const SOLID_LOG = `# NAV-12A SN-14 OFP 12.3  2026-08-18T06:10:00Z
PWR_ON t=0 temp_c=-18
BIT 0x1A ALIGN_FAIL src=GPS-1
GPS-2 ALIGN_OK t=12.4s
WARM_START GPS-1 ALIGN_OK t=40.1s temp_c=-4`;
