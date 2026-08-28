import type { CallbackQuestion, Gap, Tar107 } from "./schema.ts";

export const LABELS: Record<string, string> = {
  requestType: "TAR vs MAR",
  unit: "Unit",
  pocName: "Point of contact",
  identity: "MDS or part number",
  serialNumber: "Serial number",
  ofp: "OFP / software load",
  description: "Discrepancy description",
  firstSeen: "First seen",
  lastKnownGood: "Last known good",
  alreadyTried: "Already tried",
  missionImpact: "Mission impact",
  evidence: "Log or no-log reason",
};

export const WHY: Record<string, string> = {
  requestType: "Routing differs for engineering disposition vs depot maintenance.",
  unit: "No one to call back.",
  pocName: "A 107 without a name dies in the queue.",
  identity: "Cannot retrieve the right ICD or Brain Book slice.",
  serialNumber: "Config-specific faults (ECO, harness) hide without SN.",
  ofp: "Same symptom, different OFP, different cause.",
  description: '"Box failed" is not a discrepancy.',
  firstSeen: "Needed for change analysis.",
  lastKnownGood: "Needed for change analysis.",
  alreadyTried: "Stops repeating ATP steps the field already burned.",
  missionImpact: "Sets emergency vs routine.",
  evidence: "Without a log, an N/A reason, or a no-log explanation, signatures cannot match.",
};

/** Quick-fill when the part has no log-capable interface. */
export const NO_LOG_NA = "N/A — no digital interface on this physical part";

function descriptionOk(text: string): boolean {
  const t = text.trim();
  if (t.length < 40) return false;
  if (/box failed/i.test(t) && t.length < 80) return false;
  if (/please advise/i.test(t) && t.length < 80) return false;
  return true;
}

export function hasIdentity(tar: Tar107): boolean {
  return Boolean(tar.mds.trim() || tar.partNumber.trim());
}

export function hasEvidence(tar: Tar107): boolean {
  return tar.logAttached || Boolean(tar.noLogReason.trim());
}

export function findGaps(tar: Tar107): Gap[] {
  const gaps: Gap[] = [];
  const present: Record<string, boolean> = {
    requestType: Boolean(tar.requestType),
    unit: Boolean(tar.unit.trim()),
    pocName: Boolean(tar.pocName.trim()),
    identity: hasIdentity(tar),
    serialNumber: Boolean(tar.serialNumber.trim()),
    ofp: Boolean(tar.ofp.trim()),
    description: descriptionOk(tar.description),
    firstSeen: Boolean(tar.firstSeen.trim()),
    lastKnownGood: Boolean(tar.lastKnownGood.trim()),
    alreadyTried: Boolean(tar.alreadyTried.trim()),
    missionImpact: Boolean(tar.missionImpact.trim()),
    evidence: hasEvidence(tar),
  };
  for (const field of Object.keys(present) as Array<keyof typeof present>) {
    if (!present[field]) {
      gaps.push({
        field: field as Gap["field"],
        label: LABELS[field],
        why: WHY[field],
      });
    }
  }
  return gaps;
}

/** 0 = complete, 100 = empty. This is the "how bad is this 107" meter. */
export function hollowness(gaps: Gap[], requiredCount = 12): number {
  return Math.round((gaps.length / requiredCount) * 100);
}

export function callbackQuestions(gaps: Gap[]): CallbackQuestion[] {
  const q: Record<string, string> = {
    requestType: "Is this a TAR (engineering disposition) or a MAR (depot maintenance)?",
    unit: "What unit and site should we call back?",
    pocName: "Who is the POC, and how do we reach them?",
    identity: "What is the MDS and/or part number?",
    serialNumber: "What is the serial number on the unit?",
    ofp: "What OFP / software hash is loaded?",
    description: "Describe the discrepancy in one operational sentence (what failed, when, in what mode).",
    firstSeen: "When was this first seen?",
    lastKnownGood: "When was the last known-good employment of this SN?",
    alreadyTried: "What have you already tried, and what happened?",
    missionImpact: "What is the mission impact (emergency vs routine)?",
    evidence:
      "Attach a log excerpt, choose N/A for parts with no digital interface, or state why no log exists.",
  };
  return gaps.map((g) => ({ field: g.field, question: q[g.field] ?? `Provide ${g.label}.` }));
}

export function hollownessBand(score: number): "solid" | "thin" | "hollow" {
  if (score <= 20) return "solid";
  if (score <= 55) return "thin";
  return "hollow";
}
