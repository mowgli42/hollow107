import type { PresentedCase } from "@/lib/hollow107/aging.ts";
import type { CaseEnvelope, CaseStatus, Role, TeamDisplay } from "@/lib/hollow107";

async function parse(res: Response) {
  const data = (await res.json()) as { ok?: boolean; error?: string } & Record<string, unknown>;
  if (!res.ok || data.ok === false) throw new Error(data.error || res.statusText);
  return data;
}

export async function fetchStatus() {
  return parse(await fetch("/api/status")) as Promise<{
    ok: true;
    state: string;
    lastImport: {
      status: string;
      message: string;
      filesOk: number;
      filesFailed: number;
      finishedAt: string | null;
    } | null;
    queue: {
      total: number;
      open: number;
      needsTriage: number;
      awaitingContext: number;
      readyForEngineer: number;
      inResolution: number;
      qaReview: number;
      closed: number;
    };
    critical: number;
    oldestUnanswered: { id: string; title: string; unansweredLabel: string } | null;
  }>;
}

export async function fetchCases() {
  const data = (await parse(await fetch("/api/cases"))) as { cases: PresentedCase[] };
  return data.cases;
}

export async function fetchTeams() {
  const data = (await parse(await fetch("/api/teams"))) as { teams: TeamDisplay[] };
  return data.teams;
}

export async function fetchTeamCases(slug: string) {
  const data = (await parse(await fetch(`/api/teams/${slug}/cases`))) as {
    team: TeamDisplay;
    cases: PresentedCase[];
  };
  return data;
}

export async function fetchEnvelope(id: string) {
  const data = (await parse(await fetch(`/api/cases/${encodeURIComponent(id)}/envelope`))) as CaseEnvelope & {
    case: PresentedCase;
  };
  return data;
}

export async function ingestXmlApi(xml: string, sourceName: string, source: "web" | "api" = "web") {
  const data = (await parse(
    await fetch(`/api/ingest?source=${source}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ xml, sourceName }),
    }),
  )) as { case: PresentedCase };
  return data.case;
}

export async function scanInboxApi() {
  return parse(await fetch("/api/import/folder", { method: "POST" }));
}

export async function loadSamplesApi(reset = true) {
  const data = (await parse(
    await fetch(`/api/samples${reset ? "?reset=1" : ""}`, { method: "POST" }),
  )) as { cases: PresentedCase[] };
  return data.cases;
}

export async function mutateCase(
  id: string,
  body: Record<string, unknown>,
) {
  const data = (await parse(
    await fetch(`/api/cases/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  )) as { case: PresentedCase };
  return data.case;
}

export type { PresentedCase, CaseStatus, Role };
