# Learnings

## Open source gap is real

Searched GitHub for T.O. 00-25-107, TAR/MAR XML, JDRS, IMDS, and field-service-request avionics tools. Zero dedicated hits. "FSR" is poisoned by AMD FidelityFX Super Resolution. JDRS/IMDS are closed. Adjacent ticket-triage repos are generic helpdesks. Hollow107 is not competing with an existing OSS 107 tool — there isn't one.

## Deterministic completeness before the model

First instinct: throw the 107 at Nemotron and ask for RCA. That fails on "Box failed. Please advise ASAP." — the model will invent context. Scoring 12 required fields with a slogan-aware description check is the whole product of this slice. The LLM belongs *after* the gaps are gone (bead 4).

## Slogan length was a missed gap

"Box failed. Please advise ASAP." is ≥ 20 characters, so a naive length check treated it as a description. Added `descriptionOk()`: < 40 chars, or a "box failed" / "please advise" slogan under 80 chars, is still a gap. Tests caught this. That is the teaching artifact.

## Regex XML vs a parser

Chose a tiny tag extractor over `xmldom` so Node tests have zero extra deps and Vercel does not grow a DOM polyfill. Alternative: `fast-xml-parser`. Revisit when the official schema has attributes, namespaces, or mixed content (bead 3).

## Roles as a toggle

Auth is off. A three-button role switch is dishonest in production and honest in a demo: reviewers can feel the engineer lockout in five seconds. Capture real CAC groups as bead 2 rather than fake-login the prototype.

## localStorage vs SQLite

Persist the queue in the browser so a refresh does not dump the teaching set. No server database, no auth-scoped rows. Breaks across devices — acceptable for a two-minute demo, listed as bead 1.

## Sales pitch vs queue

The first cut led with a manifesto. Reviewers needed a queue: status, wait, criticality, ingest from a folder and a page, and APIs so other team UIs are not this React app. Envelope data (actors, timeline, logs) stays out of the XML on purpose.

