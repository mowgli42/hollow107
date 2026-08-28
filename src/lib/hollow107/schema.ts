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
export type SourceKind = "web" | "folder" | "api";
export type Criticality = "critical" | "high" | "watch" | "routine";
export type ActorRole = "submitter" | "assignee" | "watcher" | "responder";
export type EventKind =
  | "ingested"
  | "status"
  | "field_update"
  | "note"
  | "xml_response"
  | "artifact"
  | "import";
export type XmlDirection = "inbound" | "outbound";
export type XmlPurpose = "request" | "callback" | "disposition";

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

export type CaseActor = {
  id: string;
  caseId: string;
  actorRole: ActorRole;
  displayName: string;
  contact: string;
  createdAt: string;
};

export type CaseEvent = {
  id: string;
  caseId: string;
  at: string;
  kind: EventKind;
  actorName: string;
  summary: string;
  detail: Record<string, unknown>;
};

export type CaseArtifact = {
  id: string;
  caseId: string;
  kind: "log" | "note" | "screenshot" | "other";
  name: string;
  content: string;
  capturedAt: string;
};

export type CaseXmlMessage = {
  id: string;
  caseId: string;
  direction: XmlDirection;
  purpose: XmlPurpose;
  rawXml: string;
  createdAt: string;
};

export type TeamDisplay = {
  slug: string;
  name: string;
  role: Role;
  blurb: string;
  statuses: CaseStatus[];
  unitFilter: string;
};

export type CaseRecord = {
  id: string;
  title: string;
  sourceName: string;
  sourceKind: SourceKind;
  teamSlug: string;
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
  updatedAt: string;
  unansweredSince: string;
  lastActivityAt: string;
  lastAnsweredAt: string | null;
};

export type CaseEnvelope = {
  case: CaseRecord;
  actors: CaseActor[];
  events: CaseEvent[];
  artifacts: CaseArtifact[];
  xmlMessages: CaseXmlMessage[];
};

export type ImportRun = {
  id: string;
  sourceKind: SourceKind;
  status: "idle" | "running" | "ok" | "error";
  message: string;
  filesOk: number;
  filesFailed: number;
  startedAt: string;
  finishedAt: string | null;
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
