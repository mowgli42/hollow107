import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CaseResolution } from "@/components/case-resolution";
import { GapFill } from "@/components/gap-fill";
import { RequestStatus } from "@/components/request-status";
import { ROLE_LABEL, canPatchTar, type CaseRecord } from "@/lib/hollow107";
import { useEnvelope } from "@/hooks/use-ops";
import { useOpsUi } from "@/store/ops";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cases/$id")({ component: CasePage });

function CasePage() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useEnvelope(id);
  const role = useOpsUi((s) => s.role);
  const [tab, setTab] = useState<"work" | "envelope">("work");

  if (isLoading) return <p className="text-sm text-fg-muted">Loading case…</p>;
  if (error || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-medium">Case not found</h1>
        <p className="text-sm text-fg-muted">It may not have been ingested on this server yet.</p>
        <Link to="/" className="text-sm font-medium underline">
          Back to queue
        </Link>
      </div>
    );
  }

  const rec = data.case;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="font-mono text-xs tracking-widest text-fg-subtle uppercase">
          {rec.sourceName} · {rec.sourceKind} · viewing as {ROLE_LABEL[role]}
        </p>
        <h1 className="text-3xl font-medium tracking-tight">{rec.title || "Untitled 107"}</h1>
        <RequestStatus rec={rec} />
        <p className="text-sm text-fg-muted">
          {rec.tar.requestType || "—"} · {rec.tar.priority || "priority?"} ·{" "}
          {rec.tar.mds || rec.tar.partNumber || "unidentified"}
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        <TabButton active={tab === "work"} onClick={() => setTab("work")}>
          Work
        </TabButton>
        <TabButton active={tab === "envelope"} onClick={() => setTab("envelope")}>
          Envelope
        </TabButton>
        <a
          href={`/api/cases/${encodeURIComponent(rec.id)}/response.xml`}
          className="ms-auto inline-flex min-h-11 items-center px-3 text-sm text-fg-muted underline-offset-2 hover:underline"
        >
          Response XML
        </a>
      </div>

      {tab === "work" ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className="text-lg font-medium tracking-tight">Triage</h2>
            {canPatchTar(role, rec.status) ? (
              <GapFill key={rec.updatedAt} rec={rec} />
            ) : (
              <TarSummary rec={rec} />
            )}
          </section>
          <section className="space-y-5">
            <h2 className="text-xl font-medium tracking-tight">Resolution</h2>
            <CaseResolution rec={rec} role={role} />
          </section>
        </div>
      ) : (
        <EnvelopePanel data={data} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 border-b-2 px-3 text-sm font-medium",
        active ? "border-accent text-fg" : "border-transparent text-fg-muted hover:text-fg",
      )}
    >
      {children}
    </button>
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
    ["Evidence", rec.tar.logAttached ? "Log attached (see envelope)" : rec.tar.noLogReason || "None"],
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

function EnvelopePanel({
  data,
}: {
  data: NonNullable<ReturnType<typeof useEnvelope>["data"]>;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-3">
        <h2 className="text-xl font-medium">People</h2>
        {data.actors.length === 0 && <p className="text-sm text-fg-subtle">No actors recorded.</p>}
        <ul className="space-y-2">
          {data.actors.map((a) => (
            <li key={a.id} className="text-sm">
              <span className="font-mono text-xs uppercase text-fg-subtle">{a.actorRole}</span>
              <span className="ms-2">{a.displayName}</span>
              {a.contact && <span className="ms-2 text-fg-muted">{a.contact}</span>}
            </li>
          ))}
        </ul>
        <h2 className="pt-4 text-xl font-medium">Logs & artifacts</h2>
        {data.artifacts.length === 0 && (
          <p className="text-sm text-fg-subtle">No logs on the envelope. XML only records logAttached.</p>
        )}
        {data.artifacts.map((a) => (
          <div key={a.id} className="rounded-md border border-border bg-bg-subtle p-3">
            <p className="font-mono text-xs uppercase text-fg-subtle">
              {a.kind} · {a.name}
            </p>
            <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed">{a.content}</pre>
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Timeline</h2>
        <ol className="space-y-3">
          {data.events.map((e) => (
            <li key={e.id} className="border-b border-border pb-3">
              <p className="font-mono text-[10px] tracking-widest text-fg-subtle uppercase">
                {e.kind} · {new Date(e.at).toLocaleString()} {e.actorName ? `· ${e.actorName}` : ""}
              </p>
              <p className="text-sm text-fg">{e.summary}</p>
            </li>
          ))}
        </ol>
        <h2 className="pt-4 text-xl font-medium">XML messages</h2>
        {data.xmlMessages.map((m) => (
          <details key={m.id} className="rounded-md border border-border bg-bg-elevated p-3">
            <summary className="cursor-pointer font-mono text-xs uppercase text-fg-muted">
              {m.direction} · {m.purpose} · {new Date(m.createdAt).toLocaleString()}
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto font-mono text-xs leading-relaxed">{m.rawXml}</pre>
          </details>
        ))}
      </section>
    </div>
  );
}
