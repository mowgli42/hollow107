import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Graham-bell prototype</p>
        <h1 className="font-display text-4xl font-medium tracking-tight text-balance">
          Why Hollow107 exists
        </h1>
      </header>
      <p className="text-lg leading-relaxed text-pretty text-fg-muted">
        Field 107s (T.O. 00-25-107 TAR/MAR) arrive hollow: “box failed, please advise.”
        The knowledge that would fill them was generated in the lab and during flight
        test, then trapped in procedures nobody can query. This prototype shows the
        emptiness first, then a triage-to-resolution path with FSR, engineer, and QA
        views.
      </p>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-medium tracking-tight">Open source search</h2>
        <p className="leading-relaxed text-pretty text-fg-muted">
          We searched GitHub for T.O. 00-25-107, TAR/MAR XML, JDRS, IMDS, and “field
          service request” avionics tools. Nothing dedicated exists in the open. JDRS
          and IMDS are closed government systems. Hits on “FSR” are AMD FidelityFX Super
          Resolution and spaced-repetition schedulers. Adjacent ticket-triage and FSM
          repos are generic helpdesks, not 107s.
        </p>
        <p className="leading-relaxed text-pretty text-fg-muted">
          Hollow107 therefore uses an invented <code className="font-mono text-sm">TechnicalAssistanceRequest</code> XML
          inspired by 107 content — not an official schema. Do not treat it as a
          technical order.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-medium tracking-tight">What this slice validates</h2>
        <ul className="list-disc space-y-2 ps-5 text-fg-muted">
          <li>Deterministic completeness scoring beats generating a diagnosis on a slogan.</li>
          <li>Role-gated workflow: FSR fills gaps, engineer hypothesizes, QA stamps.</li>
          <li>QA cannot close a hollow case. Engineer cannot start one.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-medium tracking-tight">What it does not</h2>
        <ul className="list-disc space-y-2 ps-5 text-fg-muted">
          <li>No Nemotron / local LLM yet — narrative callbacks are a production bead.</li>
          <li>No Brain Book signature match, no real log decode.</li>
          <li>Roles are a local toggle, not CAC/auth. State is this browser only.</li>
        </ul>
      </section>

      <p className="text-sm text-fg-subtle">
        Spec: <code className="font-mono">openspec/</code> · Gherkin:{" "}
        <code className="font-mono">features/</code> · Rebuild path:{" "}
        <code className="font-mono">beads/roadmap.md</code> · Walkthrough:{" "}
        <code className="font-mono">DEMO.md</code>
      </p>
    </article>
  );
}
