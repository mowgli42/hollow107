import assert from "node:assert/strict";
import { test } from "node:test";
import { GHOST_XML, SOLID_XML, THIN_XML } from "./fixtures.ts";
import { ingestXml, parseTarXml, scoreTar } from "./index.ts";
import { findGaps, hollowness, hollownessBand } from "./triage.ts";
import { canTransition, nextActions } from "./workflow.ts";

test("ghost 107 is hollow and blocked from engineer work", () => {
  const rec = ingestXml(GHOST_XML, "ghost.xml");
  assert.equal(rec.tar.description.includes("Box failed"), true);
  assert.ok(rec.hollowness >= 80, `expected hollow, got ${rec.hollowness}`);
  assert.equal(hollownessBand(rec.hollowness), "hollow");
  assert.equal(rec.status, "awaiting-context");
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
  assert.equal(rec.status, "awaiting-context");
  assert.equal(hollownessBand(rec.hollowness), "thin");
});

test("solid 107 is ready for engineer and QA may close after review", () => {
  const rec = ingestXml(SOLID_XML, "solid.xml");
  assert.equal(rec.gaps.length, 0);
  assert.equal(rec.hollowness, 0);
  assert.equal(rec.status, "ready-for-engineer");
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

test("FSR cannot send a hollow case to engineering; QA may override", () => {
  const rec = ingestXml(GHOST_XML, "ghost.xml");
  assert.equal(canTransition(rec.status, "ready-for-engineer", "fsr", rec.hollowness), false);
  assert.equal(canTransition(rec.status, "ready-for-engineer", "qa", rec.hollowness), true);
});

test("QA cannot close while hollowness is above the gate", () => {
  assert.equal(canTransition("qa-review", "closed", "qa", 50), false);
  assert.equal(canTransition("qa-review", "closed", "qa", 10), true);
  assert.equal(canTransition("qa-review", "rejected", "qa", 90), true);
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
  const fsr = nextActions(rec, "fsr").map((a) => a.to);
  const eng = nextActions(rec, "engineer").map((a) => a.to);
  assert.equal(fsr.includes("in-resolution"), false);
  assert.equal(eng.includes("in-resolution"), true);
  assert.equal(eng.includes("closed"), false);
});
