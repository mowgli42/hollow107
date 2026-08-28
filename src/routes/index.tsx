import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { findGaps, hollowness, parseTarXml, GHOST_XML, SOLID_XML, THIN_XML } from "@/lib/hollow107";
import { HollownessMeter } from "@/components/hollowness-meter";
import { useCases } from "@/store/cases";

export const Route = createFileRoute("/")({ component: Ingest });

const ghostTar = parseTarXml(GHOST_XML);
const ghostGaps = findGaps(ghostTar);
const ghostScore = hollowness(ghostGaps);

const SAMPLES = [
  {
    id: "ghost",
    xml: GHOST_XML,
    name: "ghost-box-failed.xml",
    kicker: "Hollow",
    title: "Box failed. Please advise ASAP.",
    body: "No unit, no SN, no OFP, no log. The request that burns a week.",
  },
  {
    id: "thin",
    xml: THIN_XML,
    name: "thin-nav-align.xml",
    kicker: "Thin",
    title: "NAV align fail after cold soak",
    body: "Has a POC and a part number. Still missing SN, OFP, last-known-good, and evidence.",
  },
  {
    id: "solid",
    xml: SOLID_XML,
    name: "solid-cold-soak.xml",
    kicker: "Solid",
    title: "GPS-1 only, BIT 0x1A, below −15 C",
    body: "Complete enough to work. Engineer and QA can close this one.",
  },
] as const;

function Ingest() {
  const navigate = useNavigate();
  const ingest = useCases((s) => s.ingest);
  const loadSamples = useCases((s) => s.loadSamples);
  const [xml, setXml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  function take(source: string, name: string) {
    try {
      const rec = ingest(source, name);
      toast.success(`Ingested · hollowness ${rec.hollowness}%`);
      setError(null);
      void navigate({ to: "/cases/$id", params: { id: rec.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not parse XML";
      setError(msg);
      toast.error(msg);
    }
  }

  function onFile(file: File) {
    file
      .text()
      .then((text) => take(text, file.name))
      .catch(() => toast.error("Could not read that file"));
  }

  return (
    <div className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-5">
          <p className="font-mono text-xs font-medium tracking-widest text-accent uppercase">
            Prototype · T.O. 00-25-107 inspired
          </p>
          <h1 className="font-display text-4xl font-medium leading-tight tracking-tight text-balance text-fg sm:text-5xl">
            See how empty a field 107 really is.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-fg-muted">
            Paste or drop a TAR XML. Hollow107 scores completeness before anyone is
            allowed to diagnose. Ghost requests stay in callback. Solid ones go to
            engineering and QA.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-bg-elevated p-5 shadow-panel">
          <p className="mb-4 font-mono text-xs tracking-widest text-fg-subtle uppercase">
            Teaching artifact · ghost 107
          </p>
          <HollownessMeter score={ghostScore} gaps={ghostGaps.length} size="lg" />
          <p className="mt-4 font-display text-lg italic text-fg">
            “{ghostTar.description}”
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => take(s.xml, s.name)}
            className="rounded-lg border border-border bg-bg-elevated p-5 text-left shadow-panel transition-colors duration-150 hover:border-border-strong"
          >
            <p className="font-mono text-xs tracking-widest text-accent uppercase">{s.kicker}</p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-tight text-balance">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-fg-muted">{s.body}</p>
          </button>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-medium tracking-tight">Ingest XML</h2>
          <button
            type="button"
            onClick={() => {
              loadSamples();
              toast.success("Loaded ghost, thin, and solid teaching cases");
              void navigate({ to: "/queue" });
            }}
            className="min-h-11 rounded-md border border-border-strong px-4 text-sm font-medium hover:bg-bg-subtle"
          >
            Load teaching set
          </button>
        </div>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const file = e.dataTransfer.files[0];
            if (file) onFile(file);
          }}
          className={`block cursor-pointer rounded-lg border border-dashed p-4 transition-colors duration-150 ${
            drag ? "border-accent bg-bg-subtle" : "border-border-strong bg-bg-elevated"
          }`}
        >
          <span className="sr-only">Drop or choose a 107 XML file</span>
          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
          <p className="text-sm text-fg-muted">Drop a .xml file here, or click to choose one.</p>
          <textarea
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Paste <TechnicalAssistanceRequest>… here"
            rows={10}
            className="mt-3 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs leading-relaxed text-fg"
          />
        </label>
        {error && <p className="text-sm text-warn">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => take(xml, "pasted.xml")}
            className="min-h-11 rounded-md bg-bg-ink px-5 text-sm font-medium text-fg-invert"
          >
            Score this 107
          </button>
          <a
            href="/samples/ghost.xml"
            className="inline-flex min-h-11 items-center px-3 text-sm text-fg-muted underline-offset-4 hover:underline"
          >
            ghost.xml
          </a>
          <a
            href="/samples/thin.xml"
            className="inline-flex min-h-11 items-center px-3 text-sm text-fg-muted underline-offset-4 hover:underline"
          >
            thin.xml
          </a>
          <a
            href="/samples/solid.xml"
            className="inline-flex min-h-11 items-center px-3 text-sm text-fg-muted underline-offset-4 hover:underline"
          >
            solid.xml
          </a>
        </div>
      </section>
    </div>
  );
}
