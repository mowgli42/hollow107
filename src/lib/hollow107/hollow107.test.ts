import assert from "node:assert/strict";
import { test } from "node:test";
import { GHOST_XML, SOLID_XML, THIN_XML } from "./fixtures.ts";
import { ingestXml, parseTarXml, scoreTar, toResponseXml } from "./index.ts";
import { findGaps, hollowness, hollownessBand, NO_LOG_NA } from "./triage.ts";
import { canTransition, nextActions, workflowSteps } from "./workflow.ts";
import { caseCriticality, presentCase } from "./aging.ts";

test("ghost 107 is hollow and blocked from engineer work", () => {
  const rec = ingestXml(GHOST_XML, "ghost.xml");
  assert.equal(rec.tar.description.includes("Box failed"), true);
  assert.ok(rec.hollowness >= 80, `expected hollow, got ${rec.hollowness}`);
  assert.equal(hollownessBand(rec.hollowness), "hollow");
  assert.equal(rec.status, "ingested");
  assert.equal(canTransition(rec.status, "awaiting-context", "fsr", rec.hollowness), true);
  assert.equal(canTransition(rec.status, "in-resolution", "engineer", rec.hollowness), false);
  assert.equal(canTransition(rec.status, "closed", "qa", rec.hollowness), false);
  assert.ok(rec.questions.length >= 8);
});

test("thin 107 still demands callback for SN, OFP, evidence", () => {
  const rec = ingestXml(THIN_XML, "thin.xml");
  const fields = rec.gaps.map((g) => g.field);
  assert.ok(fields.includes("serialNumber"));
  assert.ok(fields.includes("ofp"));
  assert.ok(fields.includes("evidence"));
  assert.equal(rec.status, "ingested");
  assert.equal(hollownessBand(rec.hollowness), "thin");
});

test("solid 107 stays ingested until FSR triages", () => {
  const rec = ingestXml(SOLID_XML, "solid.xml");
  assert.equal(rec.gaps.length, 0);
  assert.equal(rec.hollowness, 0);
  assert.equal(rec.status, "ingested");
  assert.equal(canTransition(rec.status, "ready-for-engineer", "fsr", 0), true);
});

test("solid 107 is ready for engineer after triage and QA may close after review", () => {
  const rec = ingestXml(SOLID_XML, "solid.xml");
  rec.status = "ready-for-engineer";
  assert.equal(canTransition("ready-for-engineer", "in-resolution", "engineer", 0), true);
  assert.equal(canTransition("in-resolution", "qa-review", "engineer", 0), true);
  assert.equal(canTransition("qa-review", "closed", "qa", 0), true);
  assert.equal(canTransition("qa-review", "closed", "engineer", 0), false);
});

test("rejects non-TAR XML", () => {
  assert.throws(() => parseTarXml("<note>hello</note>"));
  assert.throws(() => parseTarXml(""));
});

test("short or slogan description counts as a gap", () => {
  const tar = parseTarXml(GHOST_XML);
  const gaps = findGaps(tar);
  assert.ok(gaps.some((g) => g.field === "description"));
  assert.ok(hollowness(gaps) > 0);
});

test("FSR cannot send a hollow case to engineering", () => {
  const rec = ingestXml(GHOST_XML, "ghost.xml");
  assert.equal(canTransition(rec.status, "ready-for-engineer", "fsr", rec.hollowness), false);
  assert.equal(canTransition(rec.status, "awaiting-context", "fsr", rec.hollowness), true);
  assert.equal(canTransition(rec.status, "ready-for-engineer", "qa", rec.hollowness), false);
});

test("QA can send a case back to engineering from review", () => {
  assert.equal(canTransition("qa-review", "ready-for-engineer", "qa", 90), true);
  assert.equal(canTransition("qa-review", "ready-for-engineer", "fsr", 0), false);
});

test("QA cannot close while hollowness is above the gate", () => {
  assert.equal(canTransition("qa-review", "closed", "qa", 50), false);
  assert.equal(canTransition("qa-review", "closed", "qa", 10), true);
  assert.equal(canTransition("qa-review", "rejected", "qa", 90), true);
  assert.equal(canTransition("awaiting-context", "rejected", "qa", 90), false);
});

test("filling ghost fields drops hollowness", () => {
  const rec = ingestXml(GHOST_XML, "ghost.xml");
  const filled = {
    ...rec.tar,
    requestType: "TAR" as const,
    unit: "77 MXS",
    pocName: "SSgt Reyes",
    mds: "XX-9",
    partNumber: "NAV-12A",
    serialNumber: "SN-14",
    ofp: "12.3",
    description:
      "NAV align fail after cold soak on GPS-1 only. Warm start and GPS-2 succeed. BIT 0x1A latches below -15 C.",
    firstSeen: "2026-08-18",
    lastKnownGood: "2026-07-02",
    alreadyTried: "Power cycle; swapped GPS-2 known-good.",
    missionImpact: "Cannot accept GPS-1 for envelope expansion.",
    logAttached: true,
  };
  const scored = scoreTar(filled);
  assert.equal(scored.gaps.length, 0);
  assert.equal(scored.hollowness, 0);
  assert.equal(scored.band, "solid");
});

test("nextActions are role-gated", () => {
  const rec = ingestXml(SOLID_XML, "solid.xml");
  const fsrIngested = nextActions(rec, "fsr").map((a) => a.to);
  assert.equal(fsrIngested.includes("ready-for-engineer"), true);
  assert.equal(fsrIngested.includes("in-resolution"), false);
  rec.status = "ready-for-engineer";
  const eng = nextActions(rec, "engineer").map((a) => a.to);
  assert.equal(eng.includes("in-resolution"), true);
  assert.equal(eng.includes("closed"), false);
});

test("N/A no-log reason satisfies evidence gap", () => {
  const rec = ingestXml(GHOST_XML, "ghost.xml");
  assert.equal(rec.gaps.some((g) => g.field === "evidence"), true);
  const filled = { ...rec.tar, noLogReason: NO_LOG_NA };
  const scored = scoreTar(filled);
  assert.equal(scored.gaps.some((g) => g.field === "evidence"), false);
});

test("workflow steps mark completed stages green", () => {
  const ingested = workflowSteps("ingested");
  assert.equal(ingested[0]?.label, "Triage");
  assert.equal(ingested[0]?.state, "current");
  assert.equal(ingested[3]?.state, "pending");

  const engineer = workflowSteps("in-resolution");
  assert.equal(engineer[0]?.state, "done");
  assert.equal(engineer[1]?.state, "current");

  const qa = workflowSteps("qa-review");
  assert.equal(qa[1]?.state, "done");
  assert.equal(qa[2]?.state, "current");

  const closed = workflowSteps("closed");
  assert.ok(closed.every((s) => s.state === "done"));
  assert.equal(closed[3]?.label, "Close");

  const rejected = workflowSteps("rejected");
  assert.equal(rejected[3]?.label, "Rejected");
  assert.ok(rejected.every((s) => s.state === "done"));
});

test("ingested cases show awaiting triage label", () => {
  const rec = ingestXml(GHOST_XML, "ghost.xml");
  const view = presentCase(rec, Date.parse("2026-08-28T16:00:00Z"));
  assert.match(view.unansweredLabel, /Awaiting triage/);
});

test("emergency ghost unanswered over 4h is critical", () => {
  const rec = ingestXml(GHOST_XML, "ghost.xml");
  rec.status = "awaiting-context";
  rec.unansweredSince = "2026-08-12T00:00:00Z";
  const now = Date.parse("2026-08-28T16:00:00Z");
  assert.equal(caseCriticality(rec, now), "critical");
  const view = presentCase(rec, now);
  assert.equal(view.unansweredLabel.includes("Unanswered"), true);
});

test("routine solid under 48h stays routine", () => {
  const rec = ingestXml(SOLID_XML, "solid.xml");
  rec.unansweredSince = "2026-08-28T12:00:00Z";
  assert.equal(caseCriticality(rec, Date.parse("2026-08-28T16:00:00Z")), "routine");
});

test("response XML carries status and callback questions", () => {
  const rec = ingestXml(GHOST_XML, "ghost.xml");
  const xml = toResponseXml(rec, Date.parse("2026-08-28T16:00:00Z"));
  assert.match(xml, /<TechnicalAssistanceResponse>/);
  assert.match(xml, /<purpose>callback<\/purpose>/);
  assert.match(xml, /<question field="serialNumber">/);
});

