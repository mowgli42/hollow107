import type { CallbackQuestion, Gap, Tar107 } from "./schema.ts";

export const TRIAGE_FIELD_COUNT = 5;

export const TRIAGE_FIELDS = ["unit", "pocName", "description", "missionImpact", "evidence"] as const;

export type TriageField = (typeof TRIAGE_FIELDS)[number];

export const LABELS: Record<string, string> = {
  unit: "Unit",
  pocName: "Point of contact",
  description: "Discrepancy description",
  missionImpact: "Mission impact",
  evidence: "Log",
};

export const WHY: Record<TriageField, string> = {
  unit: "No one to call back.",
  pocName: "A 107 without a name dies in the queue.",
  description: '"Box failed" is not a discrepancy.',
  missionImpact: "Sets emergency vs routine.",
  evidence: "Attach a log, mark it missing with a reason, or choose N/A for parts with no digital interface.",
};

/** Quick-fill when the part has no log-capable interface. */
export const NO_LOG_NA = "N/A — no digital interface on this physical part";

export type LogDisposition = "attached" | "missing" | "na";

function descriptionOk(text: string): boolean {
  const t = text.trim();
  if (t.length < 40) return false;
  if (/box failed/i.test(t) && t.length < 80) return false;
  if (/please advise/i.test(t) && t.length < 80) return false;
  return true;
}

export function logDisposition(tar: Tar107): LogDisposition | null {
  if (tar.logAttached) return "attached";
  const reason = tar.noLogReason.trim();
  if (reason === NO_LOG_NA) return "na";
  if (reason) return "missing";
  return null;
}

export function hasEvidence(tar: Tar107): boolean {
  return logDisposition(tar) !== null;
}

function fieldPresent(field: TriageField, tar: Tar107): boolean {
  switch (field) {
    case "unit":
      return Boolean(tar.unit.trim());
    case "pocName":
      return Boolean(tar.pocName.trim());
    case "description":
      return descriptionOk(tar.description);
    case "missionImpact":
      return Boolean(tar.missionImpact.trim());
    case "evidence":
      return hasEvidence(tar);
  }
}

/** Triage-required gaps only (unit, POC, description, mission impact, log). */
export function findGaps(tar: Tar107): Gap[] {
  const gaps: Gap[] = [];
  for (const field of TRIAGE_FIELDS) {
    if (!fieldPresent(field, tar)) {
      gaps.push({
        field,
        label: LABELS[field],
        why: WHY[field],
      });
    }
  }
  return gaps;
}

/** 0 = complete, 100 = empty. Hollowness is triage completeness. */
export function hollowness(gaps: Gap[], requiredCount = TRIAGE_FIELD_COUNT): number {
  return Math.round((gaps.length / requiredCount) * 100);
}

export function callbackQuestions(gaps: Gap[]): CallbackQuestion[] {
  const q: Record<TriageField, string> = {
    unit: "What unit and site should we call back?",
    pocName: "Who is the POC, and how do we reach them?",
    description: "Describe the discrepancy in one operational sentence (what failed, when, in what mode).",
    missionImpact: "What is the mission impact (emergency vs routine)?",
    evidence: "Attach a log, mark it missing with a reason, or choose N/A.",
  };
  return gaps.map((g) => ({ field: g.field, question: q[g.field as TriageField] ?? `Provide ${g.label}.` }));
}

export function hollownessBand(score: number): "solid" | "thin" | "hollow" {
  if (score <= 20) return "solid";
  if (score <= 55) return "thin";
  return "hollow";
}

export function triageSuggestions(cases: { tar: Tar107 }[]) {
  const units = new Set<string>();
  const pocs = new Set<string>();
  for (const { tar } of cases) {
    const unit = tar.unit.trim();
    const poc = tar.pocName.trim();
    if (unit) units.add(unit);
    if (poc) pocs.add(poc);
  }
  return {
    units: [...units].sort((a, b) => a.localeCompare(b)),
    pocs: [...pocs].sort((a, b) => a.localeCompare(b)),
  };
}
