import { getSql } from "@/lib/db";
import { SOLID_LOG } from "./fixtures.ts";
import { ingestXml, scoreTar, toResponseXml } from "./index.ts";
import { assertTransition } from "./workflow.ts";
import type {
  CaseActor,
  CaseArtifact,
  CaseEnvelope,
  CaseEvent,
  CaseRecord,
  CaseStatus,
  CaseXmlMessage,
  EventKind,
  Hypothesis,
  ImportRun,
  Role,
  SourceKind,
  Tar107,
  TeamDisplay,
  XmlPurpose,
} from "./schema.ts";

function nid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function iso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function isoOrNull(value: unknown): string | null {
  if (value == null) return null;
  return iso(value);
}

type CaseRow = Record<string, unknown>;

function rowToCase(row: CaseRow): CaseRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    sourceName: String(row.source_name),
    sourceKind: String(row.source_kind) as SourceKind,
    teamSlug: String(row.team_slug),
    rawXml: String(row.raw_xml),
    tar: parseJson<Tar107>(row.tar, {} as Tar107),
    gaps: parseJson(row.gaps, []),
    hollowness: Number(row.hollowness),
    questions: parseJson(row.questions, []),
    status: String(row.status) as CaseStatus,
    hypotheses: parseJson(row.hypotheses, []),
    engineerNotes: String(row.engineer_notes ?? ""),
    qaNotes: String(row.qa_notes ?? ""),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    unansweredSince: iso(row.unanswered_since),
    lastActivityAt: iso(row.last_activity_at),
    lastAnsweredAt: isoOrNull(row.last_answered_at),
  };
}

function rowToTeam(row: CaseRow): TeamDisplay {
  return {
    slug: String(row.slug),
    name: String(row.name),
    role: String(row.role) as Role,
    blurb: String(row.blurb),
    statuses: parseJson<CaseStatus[]>(row.statuses, []),
    unitFilter: String(row.unit_filter ?? ""),
  };
}

async function addEvent(
  caseId: string,
  kind: EventKind,
  summary: string,
  actorName = "",
  detail: Record<string, unknown> = {},
): Promise<void> {
  const sql = await getSql();
  await sql`insert into case_events (id, case_id, kind, actor_name, summary, detail)
    values (${nid("evt")}, ${caseId}, ${kind}, ${actorName}, ${summary}, ${JSON.stringify(detail)})`;
}

async function addXml(
  caseId: string,
  direction: "inbound" | "outbound",
  purpose: XmlPurpose,
  rawXml: string,
): Promise<void> {
  const sql = await getSql();
  await sql`insert into case_xml_messages (id, case_id, direction, purpose, raw_xml)
    values (${nid("xml")}, ${caseId}, ${direction}, ${purpose}, ${rawXml})`;
}

async function insertCase(rec: CaseRecord): Promise<void> {
  const sql = await getSql();
  await sql`insert into cases (
      id, title, source_name, source_kind, team_slug, raw_xml, tar, gaps, hollowness,
      questions, status, hypotheses, engineer_notes, qa_notes, created_at, updated_at,
      unanswered_since, last_activity_at, last_answered_at
    ) values (
      ${rec.id}, ${rec.title}, ${rec.sourceName}, ${rec.sourceKind}, ${rec.teamSlug},
      ${rec.rawXml}, ${JSON.stringify(rec.tar)}, ${JSON.stringify(rec.gaps)}, ${rec.hollowness},
      ${JSON.stringify(rec.questions)}, ${rec.status}, ${JSON.stringify(rec.hypotheses)},
      ${rec.engineerNotes}, ${rec.qaNotes}, ${rec.createdAt}, ${rec.updatedAt},
      ${rec.unansweredSince}, ${rec.lastActivityAt}, ${rec.lastAnsweredAt}
    )`;
}

export async function listTeams(): Promise<TeamDisplay[]> {
  const sql = await getSql();
  const rows = await sql`select * from teams order by slug`;
  return rows.map(rowToTeam);
}

export async function getTeam(slug: string): Promise<TeamDisplay | null> {
  const sql = await getSql();
  const rows = await sql`select * from teams where slug = ${slug} limit 1`;
  return rows[0] ? rowToTeam(rows[0]) : null;
}

export async function upsertTeam(input: {
  slug: string;
  name: string;
  role: Role;
  blurb: string;
  statuses: CaseStatus[];
  unitFilter?: string;
}): Promise<TeamDisplay> {
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (!slug) throw new Error("Team slug is required.");
  const sql = await getSql();
  const existing = await getTeam(slug);
  const unitFilter = input.unitFilter ?? "";
  if (existing) {
    await sql`update teams set name = ${input.name}, role = ${input.role}, blurb = ${input.blurb},
      statuses = ${JSON.stringify(input.statuses)}, unit_filter = ${unitFilter} where slug = ${slug}`;
  } else {
    await sql`insert into teams (slug, name, role, blurb, statuses, unit_filter)
      values (${slug}, ${input.name}, ${input.role}, ${input.blurb}, ${JSON.stringify(input.statuses)}, ${unitFilter})`;
  }
  const saved = await getTeam(slug);
  if (!saved) throw new Error("Failed to save team display.");
  return saved;
}

export async function listCases(filter?: {
  statuses?: CaseStatus[];
  unit?: string;
}): Promise<CaseRecord[]> {
  const sql = await getSql();
  const rows = await sql`select * from cases order by unanswered_since asc`;
  let cases = rows.map(rowToCase);
  if (filter?.statuses?.length) {
    const set = new Set(filter.statuses);
    cases = cases.filter((c) => set.has(c.status));
  }
  if (filter?.unit) {
    const unit = filter.unit.toLowerCase();
    cases = cases.filter((c) => c.tar.unit.toLowerCase().includes(unit));
  }
  return cases;
}

export async function getCase(id: string): Promise<CaseRecord | null> {
  const sql = await getSql();
  const rows = await sql`select * from cases where id = ${id} limit 1`;
  return rows[0] ? rowToCase(rows[0]) : null;
}

export async function getEnvelope(id: string): Promise<CaseEnvelope | null> {
  const rec = await getCase(id);
  if (!rec) return null;
  const sql = await getSql();
  const actors = await sql`select * from case_actors where case_id = ${id} order by created_at`;
  const events = await sql`select * from case_events where case_id = ${id} order by at desc`;
  const artifacts = await sql`select * from case_artifacts where case_id = ${id} order by captured_at desc`;
  const xmls = await sql`select * from case_xml_messages where case_id = ${id} order by created_at desc`;
  return {
    case: rec,
    actors: actors.map(
      (r): CaseActor => ({
        id: String(r.id),
        caseId: String(r.case_id),
        actorRole: r.actor_role as CaseActor["actorRole"],
        displayName: String(r.display_name),
        contact: String(r.contact ?? ""),
        createdAt: iso(r.created_at),
      }),
    ),
    events: events.map(
      (r): CaseEvent => ({
        id: String(r.id),
        caseId: String(r.case_id),
        at: iso(r.at),
        kind: r.kind as EventKind,
        actorName: String(r.actor_name ?? ""),
        summary: String(r.summary),
        detail: parseJson(r.detail, {}),
      }),
    ),
    artifacts: artifacts.map(
      (r): CaseArtifact => ({
        id: String(r.id),
        caseId: String(r.case_id),
        kind: r.kind as CaseArtifact["kind"],
        name: String(r.name),
        content: String(r.content ?? ""),
        capturedAt: iso(r.captured_at),
      }),
    ),
    xmlMessages: xmls.map(
      (r): CaseXmlMessage => ({
        id: String(r.id),
        caseId: String(r.case_id),
        direction: r.direction as CaseXmlMessage["direction"],
        purpose: r.purpose as CaseXmlMessage["purpose"],
        rawXml: String(r.raw_xml),
        createdAt: iso(r.created_at),
      }),
    ),
  };
}

export async function saveIngestedCase(
  xml: string,
  sourceName: string,
  opts: { sourceKind?: SourceKind; teamSlug?: string; actorName?: string } = {},
): Promise<CaseRecord> {
  const rec = ingestXml(xml, sourceName, {
    sourceKind: opts.sourceKind ?? "web",
    teamSlug: opts.teamSlug ?? "fsr",
  });
  await insertCase(rec);
  const sql = await getSql();
  const actorName = opts.actorName?.trim() || rec.tar.pocName.trim() || "unknown";
  const contact = rec.tar.pocContact.trim();
  await sql`insert into case_actors (id, case_id, actor_role, display_name, contact)
    values (${nid("act")}, ${rec.id}, ${"submitter"}, ${actorName}, ${contact})`;
  await addXml(rec.id, "inbound", "request", xml);
  await addEvent(rec.id, "ingested", `Ingested ${sourceName} via ${rec.sourceKind}`, actorName, {
    hollowness: rec.hollowness,
    status: rec.status,
  });
  if (rec.tar.logAttached) {
    await sql`insert into case_artifacts (id, case_id, kind, name, content)
      values (${nid("art")}, ${rec.id}, ${"log"}, ${"attached.log"}, ${SOLID_LOG})`;
    await addEvent(rec.id, "artifact", "Log excerpt stored on the envelope (not in XML).");
  }
  await addXml(rec.id, "outbound", rec.questions.length ? "callback" : "disposition", toResponseXml(rec));
  await addEvent(rec.id, "xml_response", "Callback / status XML generated.", "system");
  return rec;
}

async function persistCase(rec: CaseRecord): Promise<void> {
  const sql = await getSql();
  await sql`update cases set
      title = ${rec.title},
      tar = ${JSON.stringify(rec.tar)},
      gaps = ${JSON.stringify(rec.gaps)},
      hollowness = ${rec.hollowness},
      questions = ${JSON.stringify(rec.questions)},
      status = ${rec.status},
      hypotheses = ${JSON.stringify(rec.hypotheses)},
      engineer_notes = ${rec.engineerNotes},
      qa_notes = ${rec.qaNotes},
      updated_at = ${rec.updatedAt},
      unanswered_since = ${rec.unansweredSince},
      last_activity_at = ${rec.lastActivityAt},
      last_answered_at = ${rec.lastAnsweredAt}
    where id = ${rec.id}`;
}

export async function transitionCase(id: string, to: CaseStatus, role: Role, actorName = ""): Promise<CaseRecord> {
  const rec = await getCase(id);
  if (!rec) throw new Error("Unknown case");
  assertTransition(rec, to, role);
  const now = new Date().toISOString();
  const next: CaseRecord = {
    ...rec,
    status: to,
    updatedAt: now,
    lastActivityAt: now,
    unansweredSince: to === "closed" || to === "rejected" ? rec.unansweredSince : now,
    lastAnsweredAt: to === "closed" || to === "rejected" ? now : rec.lastAnsweredAt,
  };
  await persistCase(next);
  await addEvent(id, "status", `Moved to ${to}`, actorName || role, { from: rec.status, to, role });
  await addXml(id, "outbound", to === "closed" || to === "rejected" ? "disposition" : "callback", toResponseXml(next));
  return next;
}

export async function patchTar(id: string, patch: Partial<Tar107>, actorName = ""): Promise<CaseRecord> {
  const rec = await getCase(id);
  if (!rec) throw new Error("Unknown case");
  const tar = { ...rec.tar, ...patch };
  const scored = scoreTar(tar);
  const now = new Date().toISOString();
  const next: CaseRecord = {
    ...rec,
    tar,
    gaps: scored.gaps,
    hollowness: scored.hollowness,
    questions: scored.questions,
    title: tar.description.trim().slice(0, 72) || rec.title,
    updatedAt: now,
    lastActivityAt: now,
  };
  await persistCase(next);
  await addEvent(id, "field_update", "TAR fields updated", actorName, { fields: Object.keys(patch) });
  return next;
}

export async function addHypothesis(
  id: string,
  text: string,
  killCheck: string,
  actorName = "",
): Promise<CaseRecord> {
  const rec = await getCase(id);
  if (!rec) throw new Error("Unknown case");
  const hyp: Hypothesis = {
    id: nid("h"),
    text,
    killCheck,
    status: "open",
  };
  const now = new Date().toISOString();
  const next: CaseRecord = {
    ...rec,
    hypotheses: [...rec.hypotheses, hyp],
    updatedAt: now,
    lastActivityAt: now,
  };
  await persistCase(next);
  await addEvent(id, "note", `Hypothesis: ${text}`, actorName);
  return next;
}

export async function setHypothesisStatus(
  id: string,
  hypId: string,
  status: Hypothesis["status"],
): Promise<CaseRecord> {
  const rec = await getCase(id);
  if (!rec) throw new Error("Unknown case");
  const now = new Date().toISOString();
  const next: CaseRecord = {
    ...rec,
    hypotheses: rec.hypotheses.map((h) => (h.id === hypId ? { ...h, status } : h)),
    updatedAt: now,
    lastActivityAt: now,
  };
  await persistCase(next);
  await addEvent(id, "note", `Hypothesis ${hypId} marked ${status}`);
  return next;
}

export async function setNotes(
  id: string,
  which: "engineerNotes" | "qaNotes",
  value: string,
  actorName = "",
): Promise<CaseRecord> {
  const rec = await getCase(id);
  if (!rec) throw new Error("Unknown case");
  const now = new Date().toISOString();
  const next: CaseRecord = { ...rec, [which]: value, updatedAt: now, lastActivityAt: now };
  await persistCase(next);
  await addEvent(id, "note", `${which} updated`, actorName);
  return next;
}

export async function addArtifact(
  id: string,
  input: { kind: CaseArtifact["kind"]; name: string; content: string },
): Promise<CaseRecord> {
  const rec = await getCase(id);
  if (!rec) throw new Error("Unknown case");
  const sql = await getSql();
  await sql`insert into case_artifacts (id, case_id, kind, name, content)
    values (${nid("art")}, ${id}, ${input.kind}, ${input.name}, ${input.content})`;
  await addEvent(id, "artifact", `Stored ${input.kind}: ${input.name}`);
  return rec;
}

export async function latestImportRun(): Promise<ImportRun | null> {
  const sql = await getSql();
  const rows = await sql`select * from import_runs order by started_at desc limit 1`;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    sourceKind: String(row.source_kind) as SourceKind,
    status: String(row.status) as ImportRun["status"],
    message: String(row.message),
    filesOk: Number(row.files_ok),
    filesFailed: Number(row.files_failed),
    startedAt: iso(row.started_at),
    finishedAt: isoOrNull(row.finished_at),
  };
}

export async function recordImportRun(run: Omit<ImportRun, "id"> & { id?: string }): Promise<ImportRun> {
  const sql = await getSql();
  const id = run.id ?? nid("imp");
  await sql`insert into import_runs (id, source_kind, status, message, files_ok, files_failed, started_at, finished_at)
    values (${id}, ${run.sourceKind}, ${run.status}, ${run.message}, ${run.filesOk}, ${run.filesFailed}, ${run.startedAt}, ${run.finishedAt})`;
  return { ...run, id };
}

export async function queueSnapshot() {
  const cases = await listCases();
  const open = cases.filter((c) => c.status !== "closed" && c.status !== "rejected");
  return {
    total: cases.length,
    open: open.length,
    needsTriage: cases.filter((c) => c.status === "ingested").length,
    awaitingContext: cases.filter((c) => c.status === "awaiting-context").length,
    readyForEngineer: cases.filter((c) => c.status === "ready-for-engineer").length,
    inResolution: cases.filter((c) => c.status === "in-resolution").length,
    qaReview: cases.filter((c) => c.status === "qa-review").length,
    closed: cases.filter((c) => c.status === "closed" || c.status === "rejected").length,
  };
}

export async function clearCases(): Promise<void> {
  const sql = await getSql();
  await sql`delete from cases`;
}
