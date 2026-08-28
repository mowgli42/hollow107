/** Canonical 107 fields. Inspired by T.O. 00-25-107 content, not an official schema. */

export const REQUIRED_FIELDS = [
  "requestType",
  "unit",
  "pocName",
  "serialNumber",
  "ofp",
  "description",
  "firstSeen",
  "lastKnownGood",
  "alreadyTried",
  "missionImpact",
  "evidence",
] as const;

export const IDENTITY_FIELDS = ["mds", "partNumber"] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];

export type RequestType = "TAR" | "MAR" | "";
export type Priority = "emergency" | "routine" | "";
export type CaseStatus =
  | "ingested"
  | "awaiting-context"
  | "ready-for-engineer"
  | "in-resolution"
  | "qa-review"
  | "closed"
  | "rejected";

export type Role = "fsr" | "engineer" | "qa";

export type Tar107 = {
  requestType: RequestType;
  priority: Priority;
  submittedAt: string;
  unit: string;
  site: string;
  pocName: string;
  pocContact: string;
  mds: string;
  nsn: string;
  partNumber: string;
  serialNumber: string;
  ofp: string;
  icd: string;
  toInUse: string;
  description: string;
  bitCode: string;
  firstSeen: string;
  lastKnownGood: string;
  alreadyTried: string;
  missionImpact: string;
  logAttached: boolean;
  noLogReason: string;
};

export type Gap = {
  field: RequiredField | "identity";
  label: string;
  why: string;
};

export type CallbackQuestion = {
  field: string;
  question: string;
};

export type Hypothesis = {
  id: string;
  text: string;
  killCheck: string;
  status: "open" | "supported" | "ruled-out";
};

export type CaseRecord = {
  id: string;
  title: string;
  sourceName: string;
  rawXml: string;
  tar: Tar107;
  gaps: Gap[];
  hollowness: number;
  questions: CallbackQuestion[];
  status: CaseStatus;
  hypotheses: Hypothesis[];
  engineerNotes: string;
  qaNotes: string;
  createdAt: string;
};

export function emptyTar(): Tar107 {
  return {
    requestType: "",
    priority: "",
    submittedAt: "",
    unit: "",
    site: "",
    pocName: "",
    pocContact: "",
    mds: "",
    nsn: "",
    partNumber: "",
    serialNumber: "",
    ofp: "",
    icd: "",
    toInUse: "",
    description: "",
    bitCode: "",
    firstSeen: "",
    lastKnownGood: "",
    alreadyTried: "",
    missionImpact: "",
    logAttached: false,
    noLogReason: "",
  };
}
