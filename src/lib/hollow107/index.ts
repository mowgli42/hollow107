import { parseTarXml } from "./parse.ts";
import { callbackQuestions, findGaps, hollowness, hollownessBand } from "./triage.ts";
import { initialStatus } from "./workflow.ts";
import { parseTime } from "./aging.ts";
import type { CaseRecord, SourceKind, Tar107 } from "./schema.ts";

export * from "./schema.ts";
export * from "./parse.ts";
export * from "./triage.ts";
export * from "./workflow.ts";
export * from "./fixtures.ts";
export * from "./aging.ts";
export * from "./response-xml.ts";

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

export function ingestXml(
  xml: string,
  sourceName = "pasted.xml",
  opts: { sourceKind?: SourceKind; teamSlug?: string; now?: Date } = {},
): CaseRecord {
  const tar = parseTarXml(xml);
  const scored = scoreTar(tar);
  const nowMs = (opts.now ?? new Date()).getTime();
  const now = new Date(nowMs).toISOString();
  const unansweredSince = tar.submittedAt.trim()
    ? new Date(parseTime(tar.submittedAt.trim(), nowMs)).toISOString()
    : now;
  const title =
    tar.description.trim().slice(0, 72) ||
    `${tar.requestType || "107"} ${tar.serialNumber || tar.partNumber || "unidentified"}`;
  return {
    id: `H107-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    sourceName,
    sourceKind: opts.sourceKind ?? "web",
    teamSlug: opts.teamSlug ?? "fsr",
    rawXml: xml,
    tar,
    gaps: scored.gaps,
    hollowness: scored.hollowness,
    questions: scored.questions,
    status: initialStatus(),
    hypotheses: [],
    engineerNotes: "",
    qaNotes: "",
    createdAt: now,
    updatedAt: now,
    unansweredSince,
    lastActivityAt: now,
    lastAnsweredAt: null,
  };
}

export function describeBand(score: number): string {
  const band = hollownessBand(score);
  if (band === "solid") return "Solid enough to work";
  if (band === "thin") return "Thin — callback before diagnosis";
  return "Hollow — do not diagnose";
}
