import { caseCriticality, unansweredMs } from "./aging.ts";
import { STATUS_LABEL } from "./workflow.ts";
import type { CaseRecord } from "./schema.ts";

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** XML is the interchange. Envelope (users, timeline, logs) stays in the store. */
export function toResponseXml(rec: CaseRecord, nowMs = Date.now()): string {
  const crit = caseCriticality(rec, nowMs);
  const age = unansweredMs(rec, nowMs);
  const hours = age == null ? "0" : (age / 3600_000).toFixed(1);
  const purpose =
    rec.status === "closed" || rec.status === "rejected"
      ? "disposition"
      : rec.questions.length
        ? "callback"
        : "disposition";
  const questions = rec.questions
    .map((q) => `    <question field="${esc(q.field)}">${esc(q.question)}</question>`)
    .join("\n");
  const disposition =
    rec.status === "closed"
      ? rec.qaNotes.trim() || "Closed."
      : rec.status === "rejected"
        ? rec.qaNotes.trim() || "Rejected."
        : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<TechnicalAssistanceResponse>
  <caseId>${esc(rec.id)}</caseId>
  <status>${esc(rec.status)}</status>
  <statusLabel>${esc(STATUS_LABEL[rec.status])}</statusLabel>
  <hollowness>${rec.hollowness}</hollowness>
  <criticality>${esc(crit)}</criticality>
  <unansweredHours>${hours}</unansweredHours>
  <purpose>${purpose}</purpose>
  <callback>
${questions || "    "}
  </callback>
  <disposition>${esc(disposition)}</disposition>
</TechnicalAssistanceResponse>
`;
}
