import type { CaseRecord, CaseStatus, Role } from "./schema.ts";

export const STATUS_LABEL: Record<CaseStatus, string> = {
  ingested: "Ingested",
  "awaiting-context": "Awaiting context",
  "ready-for-engineer": "Ready for engineer",
  "in-resolution": "In resolution",
  "qa-review": "QA review",
  closed: "Closed",
  rejected: "Rejected",
};

export const ROLE_LABEL: Record<Role, string> = {
  fsr: "FSR",
  engineer: "Engineer",
  qa: "QA",
};

export function initialStatus(hollowness: number): CaseStatus {
  return hollowness > 20 ? "awaiting-context" : "ready-for-engineer";
}

export function canTransition(from: CaseStatus, to: CaseStatus, role: Role, hollowness: number): boolean {
  if (from === to) return false;
  if (from === "closed" || from === "rejected") return false;
  if (to === "awaiting-context") return role === "fsr" || role === "qa";
  if (to === "ready-for-engineer") {
    if (hollowness > 20 && role !== "qa") return false;
    return from === "ingested" || from === "awaiting-context";
  }
  if (to === "in-resolution") {
    return role === "engineer" && (from === "ready-for-engineer" || from === "qa-review");
  }
  if (to === "qa-review") {
    return role === "engineer" && from === "in-resolution";
  }
  if (to === "closed") {
    return role === "qa" && from === "qa-review" && hollowness <= 20;
  }
  if (to === "rejected") {
    return role === "qa" && (from === "qa-review" || from === "awaiting-context");
  }
  return false;
}

export function assertTransition(rec: CaseRecord, to: CaseStatus, role: Role): void {
  if (!canTransition(rec.status, to, role, rec.hollowness)) {
    throw new Error(`Role ${role} cannot move a ${rec.status} case (hollowness ${rec.hollowness}) to ${to}.`);
  }
}

export type WorkflowAction = { to: CaseStatus; label: string };

export function nextActions(rec: CaseRecord, role: Role): WorkflowAction[] {
  const candidates: WorkflowAction[] = [
    { to: "awaiting-context", label: "Send back for context" },
    { to: "ready-for-engineer", label: "Send to engineer" },
    {
      to: "in-resolution",
      label: rec.status === "qa-review" ? "Resume resolution" : "Start resolution",
    },
    { to: "qa-review", label: "Submit for QA" },
    { to: "closed", label: "Close" },
    { to: "rejected", label: "Reject" },
  ];
  return candidates.filter((c) => canTransition(rec.status, c.to, role, rec.hollowness));
}
