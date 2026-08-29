import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Data plan</p>
        <h1 className="text-3xl font-medium tracking-tight">XML in, envelope beside it</h1>
      </header>
      <p className="text-sm leading-relaxed text-fg-muted">
        A 107 arrives and leaves as XML. Everything used to troubleshoot — who touched it, how long it sat, logs,
        notes — lives next to that XML, not inside it.
      </p>
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Interchange (XML)</h2>
        <ul className="list-disc space-y-1 ps-5 text-sm text-fg-muted">
          <li>Inbound: <code className="font-mono">TechnicalAssistanceRequest</code></li>
          <li>Outbound: <code className="font-mono">TechnicalAssistanceResponse</code> (callback or disposition)</li>
          <li>GET <code className="font-mono">/api/cases/:id/response.xml</code></li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Envelope (not in XML)</h2>
        <ul className="list-disc space-y-1 ps-5 text-sm text-fg-muted">
          <li>Actors — submitter, assignee, watchers</li>
          <li>Timeline — ingest, status moves, field updates, notes</li>
          <li>Artifacts — log excerpts, later screenshots</li>
          <li>Import runs — web vs folder vs API</li>
          <li>Derived — unanswered clock, criticality</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Team displays</h2>
        <p className="text-sm text-fg-muted">
          <code className="font-mono">POST /api/teams</code> creates a landing page at{" "}
          <code className="font-mono">/t/:slug</code> and a filtered queue at{" "}
          <code className="font-mono">/api/teams/:slug/cases</code>. Seeded: fsr, engineer, qa, ops.
        </p>
      </section>
      <p className="text-xs text-fg-subtle">
        Full write-up: <code className="font-mono">docs/DATA-PLAN.md</code>
      </p>
    </article>
  );
}
