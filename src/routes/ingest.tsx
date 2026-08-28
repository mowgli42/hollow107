import { createFileRoute } from "@tanstack/react-router";
import { IngestPanel } from "@/components/ingest-panel";

export const Route = createFileRoute("/ingest")({ component: IngestPage });

function IngestPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Import</p>
        <h1 className="text-3xl font-medium tracking-tight">Bring in a 107</h1>
        <p className="max-w-2xl text-sm text-fg-muted">
          Two paths, same API: paste or drop XML here, or drop files into <code className="font-mono">data/inbox</code>{" "}
          and scan. Folder import is local; Vercel uses this page or <code className="font-mono">POST /api/ingest</code>.
        </p>
      </div>
      <IngestPanel />
    </div>
  );
}
