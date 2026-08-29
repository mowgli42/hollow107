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

export const STAGE_STATUSES = {
  triage: ["ingested", "awaiting-context"] as const satisfies readonly CaseStatus[],
  engineer: ["ready-for-engineer", "in-resolution"] as const satisfies readonly CaseStatus[],
  qa: ["qa-review"] as const satisfies readonly CaseStatus[],
  closed: ["closed", "rejected"] as const satisfies readonly CaseStatus[],
};

export type WorkflowStage = keyof typeof STAGE_STATUSES;

export const OPEN_STATUSES: CaseStatus[] = [
  ...STAGE_STATUSES.triage,
  ...STAGE_STATUSES.engineer,
  ...STAGE_STATUSES.qa,
];

export function stageForStatus(status: CaseStatus): WorkflowStage | null {
  if ((STAGE_STATUSES.triage as readonly CaseStatus[]).includes(status)) return "triage";
  if ((STAGE_STATUSES.engineer as readonly CaseStatus[]).includes(status)) return "engineer";
  if ((STAGE_STATUSES.qa as readonly CaseStatus[]).includes(status)) return "qa";
  if ((STAGE_STATUSES.closed as readonly CaseStatus[]).includes(status)) return "closed";
  return null;
}

export function matchesStage(status: CaseStatus, stage: WorkflowStage | "open"): boolean {
  if (stage === "open") return OPEN_STATUSES.includes(status);
  return (STAGE_STATUSES[stage] as readonly CaseStatus[]).includes(status);
}

export function defaultRouteForRole(role: Role): "/" | "/triage" | "/engineer" | "/qa" {
  if (role === "fsr") return "/triage";
  if (role === "engineer") return "/engineer";
  return "/qa";
}

export function canPatchTar(role: Role, status: CaseStatus): boolean {
  return role === "fsr" && matchesStage(status, "triage");
}

export function canManageHypotheses(role: Role, status: CaseStatus): boolean {
  return role === "engineer" && matchesStage(status, "engineer");
}

export function canEditEngineerNotes(role: Role): boolean {
  return role === "engineer";
}

export function canEditQaNotes(role: Role, status: CaseStatus): boolean {
  return role === "qa" && matchesStage(status, "qa");
}

export function canActOnStage(role: Role, stage: WorkflowStage): boolean {
  if (stage === "triage") return role === "fsr";
  if (stage === "engineer") return role === "engineer";
  if (stage === "qa") return role === "qa";
  return false;
}

/** Fresh imports land here until an FSR completes triage. */
export function initialStatus(): CaseStatus {
  return "ingested";
}

/** Post-triage routing from hollowness score. */
export function triageTarget(hollowness: number): CaseStatus {
  return hollowness > 20 ? "awaiting-context" : "ready-for-engineer";
}

export function canTransition(from: CaseStatus, to: CaseStatus, role: Role, hollowness: number): boolean {
  if (from === to) return false;
  if (from === "closed" || from === "rejected") return false;
  if (to === "awaiting-context") {
    return role === "fsr" && (from === "ingested" || from === "awaiting-context" || from === "ready-for-engineer");
  }
  if (to === "ready-for-engineer") {
    if (from === "qa-review") return role === "qa";
    if (from === "in-resolution") return role === "engineer";
    if (role !== "fsr") return false;
    if (hollowness > 20) return false;
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
    return role === "qa" && from === "qa-review";
  }
  return false;
}

export function assertTransition(rec: CaseRecord, to: CaseStatus, role: Role): void {
  if (!canTransition(rec.status, to, role, rec.hollowness)) {
    throw new Error(`Role ${role} cannot move a ${rec.status} case (hollowness ${rec.hollowness}) to ${to}.`);
  }
}

export type WorkflowAction = { to: CaseStatus; label: string; direction: "forward" | "backward" };

const STATUS_RANK: Record<CaseStatus, number> = {
  ingested: 0,
  "awaiting-context": 1,
  "ready-for-engineer": 2,
  "in-resolution": 3,
  "qa-review": 4,
  closed: 5,
  rejected: 5,
};

function moveDirection(from: CaseStatus, to: CaseStatus): "forward" | "backward" {
  if (to === "rejected") return "forward";
  if (to === "awaiting-context" && from === "ready-for-engineer") return "backward";
  return STATUS_RANK[to] >= STATUS_RANK[from] ? "forward" : "backward";
}

export function roleGuidance(role: Role, status: CaseStatus): string[] {
  if (status === "closed" || status === "rejected") {
    return ["Ticket is terminal. Review the envelope for the audit trail."];
  }
  if (role === "fsr") {
    if (!matchesStage(status, "triage")) {
      return [
        "Triage is complete.",
        "Use Back to pull the ticket back for more context, or switch role for downstream work.",
      ];
    }
    if (status === "ingested") {
      return [
        "Confirm unit, POC, description, mission impact, and log disposition.",
        "Route to engineer when triage is solid, or await context if gaps remain.",
      ];
    }
    return [
      "Fill any remaining triage fields with the unit.",
      "Send to engineer when hollowness is 20% or below.",
    ];
  }
  if (role === "engineer") {
    if (status === "ready-for-engineer") {
      return ["Review the TAR summary.", "Start resolution and record hypotheses with kill-checks."];
    }
    if (status === "in-resolution") {
      return ["Work hypotheses against the log.", "Submit for QA when resolution is ready."];
    }
    return ["Engineering actions unlock when the ticket is in your queue."];
  }
  if (role === "qa") {
    if (status === "qa-review") {
      return [
        "Review engineer notes and hypotheses.",
        "Close if solid, reject if invalid, or send back to engineering.",
      ];
    }
    return ["QA actions unlock when the ticket is in review."];
  }
  return ["Switch role or wait for the ticket to reach your queue."];
}

export function nextActions(rec: CaseRecord, role: Role): WorkflowAction[] {
  const triage = rec.status === "ingested";
  const fromQa = rec.status === "qa-review";
  const candidates: Omit<WorkflowAction, "direction">[] = [
    { to: "awaiting-context", label: triage ? "Triage → await context" : "Send back for context" },
    {
      to: "ready-for-engineer",
      label: triage
        ? "Triage → send to engineer"
        : fromQa
          ? "Send back to engineer"
          : rec.status === "in-resolution"
            ? "Return to engineer queue"
            : "Send to engineer",
    },
    {
      to: "in-resolution",
      label: rec.status === "qa-review" ? "Resume resolution" : "Start resolution",
    },
    { to: "qa-review", label: "Submit for QA" },
    { to: "closed", label: "Close" },
    { to: "rejected", label: "Reject" },
  ];
  return candidates
    .filter((c) => canTransition(rec.status, c.to, role, rec.hollowness))
    .map((c) => ({ ...c, direction: moveDirection(rec.status, c.to) }));
}

export function workflowMoves(rec: CaseRecord, role: Role) {
  const moves = nextActions(rec, role);
  return {
    forward: moves.filter((m) => m.direction === "forward"),
    backward: moves.filter((m) => m.direction === "backward"),
  };
}

export type WorkflowStepState = "done" | "current" | "pending";

export type WorkflowStep = {
  id: string;
  label: string;
  state: WorkflowStepState;
};

const PIPELINE = [
  { id: "triage", label: "Triage" },
  { id: "engineer", label: "Engineer" },
  { id: "qa", label: "QA" },
  { id: "close", label: "Close" },
] as const;

function pipelineIndex(status: CaseStatus): number {
  switch (status) {
    case "ingested":
    case "awaiting-context":
      return 0;
    case "ready-for-engineer":
    case "in-resolution":
      return 1;
    case "qa-review":
      return 2;
    case "closed":
    case "rejected":
      return 3;
  }
}

/** Linear 107 lifecycle for the step UI. */
export function workflowSteps(status: CaseStatus): WorkflowStep[] {
  const idx = pipelineIndex(status);
  const terminal = status === "closed" || status === "rejected";
  return PIPELINE.map((step, i) => ({
    ...step,
    label: terminal && step.id === "close" && status === "rejected" ? "Rejected" : step.label,
    state: terminal ? "done" : i < idx ? "done" : i === idx ? "current" : "pending",
  }));
}
