import { emptyTar, type Tar107 } from "./schema.ts";

/** Tiny tag extractor so Node tests need no DOMParser. Rejected xmldom as a dep. */
export function textOf(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(re);
  if (!match) return "";
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function boolOf(xml: string, tag: string): boolean {
  const v = textOf(xml, tag).toLowerCase();
  return v === "true" || v === "yes" || v === "1";
}

export function parseTarXml(xml: string): Tar107 {
  if (!xml.trim()) {
    throw new Error("XML is empty.");
  }
  if (!/<TechnicalAssistanceRequest/i.test(xml) && !/<tar107/i.test(xml)) {
    throw new Error("Not a Hollow107 TAR XML document (missing TechnicalAssistanceRequest).");
  }
  const tar = emptyTar();
  const type = textOf(xml, "requestType").toUpperCase();
  tar.requestType = type === "MAR" ? "MAR" : type === "TAR" ? "TAR" : "";
  const pri = textOf(xml, "priority").toLowerCase();
  tar.priority = pri === "emergency" ? "emergency" : pri === "routine" ? "routine" : "";
  tar.submittedAt = textOf(xml, "submittedAt");
  tar.unit = textOf(xml, "unit");
  tar.site = textOf(xml, "site");
  tar.pocName = textOf(xml, "pocName");
  tar.pocContact = textOf(xml, "pocContact");
  tar.mds = textOf(xml, "mds");
  tar.nsn = textOf(xml, "nsn");
  tar.partNumber = textOf(xml, "partNumber");
  tar.serialNumber = textOf(xml, "serialNumber");
  tar.ofp = textOf(xml, "ofp");
  tar.icd = textOf(xml, "icd");
  tar.toInUse = textOf(xml, "toInUse");
  tar.description = textOf(xml, "description");
  tar.bitCode = textOf(xml, "bitCode");
  tar.firstSeen = textOf(xml, "firstSeen");
  tar.lastKnownGood = textOf(xml, "lastKnownGood");
  tar.alreadyTried = textOf(xml, "alreadyTried");
  tar.missionImpact = textOf(xml, "missionImpact");
  tar.logAttached = boolOf(xml, "logAttached");
  tar.noLogReason = textOf(xml, "noLogReason");
  return tar;
}
