import { parseTarXml } from "./parse.ts";
import { callbackQuestions, findGaps, hollowness, hollownessBand } from "./triage.ts";
import { initialStatus } from "./workflow.ts";
import type { CaseRecord, Tar107 } from "./schema.ts";

export * from "./schema.ts";
export * from "./parse.ts";
export * from "./triage.ts";
export * from "./workflow.ts";
export * from "./fixtures.ts";

export function scoreTar(tar: Tar107) {
  const gaps = findGaps(tar);
  const score = hollowness(gaps);
  return {
    gaps,
    hollowness: score,
    questions: callbackQuestions(gaps),
    band: hollownessBand(score),
  };
}

export function ingestXml(xml: string, sourceName = "pasted.xml"): CaseRecord {
  const tar = parseTarXml(xml);
  const scored = scoreTar(tar);
  const title =
    tar.description.trim().slice(0, 72) ||
    `${tar.requestType || "107"} ${tar.serialNumber || tar.partNumber || "unidentified"}`;
  return {
    id: `H107-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    sourceName,
    rawXml: xml,
    tar,
    gaps: scored.gaps,
    hollowness: scored.hollowness,
    questions: scored.questions,
    status: initialStatus(scored.hollowness),
    hypotheses: [],
    engineerNotes: "",
    qaNotes: "",
    createdAt: new Date().toISOString(),
  };
}

export function describeBand(score: number): string {
  const band = hollownessBand(score);
  if (band === "solid") return "Solid enough to work";
  if (band === "thin") return "Thin — callback before diagnosis";
  return "Hollow — do not diagnose";
}
