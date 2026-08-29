import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useIngestMutation, useSamplesMutation, useScanInboxMutation } from "@/hooks/use-ops";

export function IngestPanel({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const ingest = useIngestMutation();
  const scan = useScanInboxMutation();
  const samples = useSamplesMutation();
  const [xml, setXml] = useState("");
  const [drag, setDrag] = useState(false);

  function take(source: string, name: string) {
    ingest.mutate(
      { xml: source, sourceName: name },
      {
        onSuccess: (rec) => {
          void navigate({ to: "/cases/$id", params: { id: rec.id } });
        },
      },
    );
  }

  function onFile(file: File) {
    void file.text().then((text) => take(text, file.name));
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium tracking-tight">{compact ? "Import" : "Import 107 XML"}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => scan.mutate()}
            className="min-h-11 rounded-md border border-border-strong px-3 text-sm font-medium hover:bg-bg-subtle"
          >
            Scan inbox folder
          </button>
          <button
            type="button"
            onClick={() =>
              samples.mutate(undefined, {
                onSuccess: () => void navigate({ to: "/" }),
              })
            }
            className="min-h-11 rounded-md border border-border-strong px-3 text-sm font-medium hover:bg-bg-subtle"
          >
            Load samples
          </button>
        </div>
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
        className={`block cursor-pointer rounded-md border border-dashed p-4 ${
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
        <p className="text-sm text-fg-muted">Drop a .xml file, paste below, or scan data/inbox.</p>
        <textarea
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="<TechnicalAssistanceRequest>…"
          rows={compact ? 6 : 10}
          className="mt-3 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs leading-relaxed text-fg"
        />
      </label>
      <button
        type="button"
        onClick={() => take(xml, "pasted.xml")}
        className="min-h-11 rounded-md bg-bg-ink px-5 text-sm font-medium text-fg-invert"
      >
        Ingest XML
      </button>
    </section>
  );
}
