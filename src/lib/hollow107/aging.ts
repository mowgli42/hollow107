import type { CaseRecord, CaseStatus, Criticality, Priority } from "./schema.ts";

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export function parseTime(iso: string, fallbackMs: number): number {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : fallbackMs;
}

export function unansweredMs(rec: CaseRecord, nowMs = Date.now()): number | null {
  if (rec.status === "closed" || rec.status === "rejected") return null;
  return Math.max(0, nowMs - parseTime(rec.unansweredSince, nowMs));
}

export function formatDuration(ms: number): string {
  if (ms < 60_000) return "<1m";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(ms / HOUR);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(ms / DAY);
  const remH = Math.floor((ms % DAY) / HOUR);
  return remH ? `${days}d ${remH}h` : `${days}d`;
}

export function formatRelativePast(ms: number): string {
  if (ms < 60_000) return "just now";
  return `${formatDuration(ms)} ago`;
}

export function lastUpdatedLabel(rec: CaseRecord, nowMs = Date.now()): string {
  const ms = Math.max(0, nowMs - parseTime(rec.updatedAt, nowMs));
  return `Updated ${formatRelativePast(ms)}`;
}

export function unansweredLabel(rec: CaseRecord, nowMs = Date.now()): string {
  if (rec.status === "ingested") {
    const ms = Math.max(0, nowMs - parseTime(rec.createdAt, nowMs));
    return ms < 60_000 ? "Awaiting triage" : `Awaiting triage ${formatDuration(ms)}`;
  }
  const ms = unansweredMs(rec, nowMs);
  if (ms == null) return rec.status === "closed" ? "Closed" : "Rejected";
  return `Unanswered ${formatDuration(ms)}`;
}

export function deriveCriticality(
  priority: Priority,
  hollowness: number,
  unanswered: number | null,
  status: CaseStatus,
): Criticality {
  if (status === "closed" || status === "rejected") return "routine";
  const hours = unanswered == null ? 0 : unanswered / HOUR;
  if (priority === "emergency" && hours >= 4) return "critical";
  if (priority === "emergency") return "high";
  if (hollowness >= 80 && hours >= 24) return "high";
  if (hours >= 48) return "watch";
  return "routine";
}

export function caseCriticality(rec: CaseRecord, nowMs = Date.now()): Criticality {
  return deriveCriticality(rec.tar.priority, rec.hollowness, unansweredMs(rec, nowMs), rec.status);
}

export function presentCase(rec: CaseRecord, nowMs = Date.now()) {
  return {
    ...rec,
    criticality: caseCriticality(rec, nowMs),
    unansweredLabel: unansweredLabel(rec, nowMs),
    unansweredMs: unansweredMs(rec, nowMs),
    lastUpdatedLabel: lastUpdatedLabel(rec, nowMs),
  };
}

export type PresentedCase = ReturnType<typeof presentCase>;

export const CRITICALITY_LABEL: Record<Criticality, string> = {
  critical: "Critical",
  high: "High",
  watch: "Watch",
  routine: "Routine",
};
