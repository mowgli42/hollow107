import { GHOST_XML, SOLID_XML, THIN_XML } from "@/lib/hollow107";
import { recordImportRun, saveIngestedCase } from "./store.server.ts";

export const SAMPLE_FILES = [
  { name: "ghost-box-failed.xml", xml: GHOST_XML },
  { name: "thin-nav-align.xml", xml: THIN_XML },
  { name: "solid-cold-soak.xml", xml: SOLID_XML },
] as const;

export async function loadSampleCases() {
  const startedAt = new Date().toISOString();
  const out = [];
  for (const sample of SAMPLE_FILES) {
    out.push(await saveIngestedCase(sample.xml, sample.name, { sourceKind: "web", teamSlug: "fsr" }));
  }
  await recordImportRun({
    sourceKind: "web",
    status: "ok",
    message: `Loaded ${out.length} sample 107s`,
    filesOk: out.length,
    filesFailed: 0,
    startedAt,
    finishedAt: new Date().toISOString(),
  });
  return out;
}
