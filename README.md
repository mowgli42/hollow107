# Hollow107

**See how empty a field 107 really is.**

A graham-bell prototype for inbound T.O. 00-25-107 TAR/MAR triage. Ingest invented TAR XML, score **hollowness** (how empty the request is), force callback on missing context, then run a resolution workflow with different views for FSR, engineer, and QA.

Live: [hollow107.vercel.app](https://hollow107.vercel.app)

This is not a technical order, not JDRS, and not an airworthy disposition. The XML schema is invented because no public 107 schema exists.

## Why it exists

GitHub has no dedicated open-source tool for 107s or field-service-rep requests. JDRS and IMDS are closed. Searches for “FSR” return AMD FidelityFX Super Resolution. Knowledge generated in lab and flight test still reaches the field as a procedure and a hollow form.

Hollow107 makes the emptiness visible first.

## What the prototype validates

- Ghost 107 (“Box failed. Please advise ASAP.”) scores hollow and **cannot** be diagnosed.
- Thin 107s still demand SN, OFP, last-known-good, and evidence.
- Solid 107s flow FSR → engineer (hypotheses + kill-checks) → QA close.
- QA cannot close a hollow case. Engineer cannot start one.

What it does **not** do (see `beads/roadmap.md`): Nemotron callbacks, Brain Book signature match, real log decode, CAC roles, durable persistence, official JDRS schema.

## Stack

TanStack Start, React 19, Tailwind v4, Zustand (localStorage). Completeness scoring is pure functions — no GPU, no LLM in this slice.

## Specs

| Artifact | Path |
|---|---|
| OpenSpec | `openspec/` |
| Gherkin (`@validated` / `@future`) | `features/` |
| Beads (production rebuild) | `beads/roadmap.md` |
| Demo walkthrough | `DEMO.md` |
| Learnings | `LEARNINGS.md` |
| Teaching XML | `public/samples/` |

## License

MIT. Do not put real CUI or classified 107s in this app.
