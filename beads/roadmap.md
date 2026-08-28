# Beads — production rebuild path

Ordered. Do **not** implement these in the prototype. Each bead is "what we would do differently if this had to survive real users."

1. **Durable persistence** — Cases now live in PGLite (preview) / Neon (`DATABASE_URL`). Folder import still resets when the in-memory PGLite process dies. File-backed PGLite or always-on Neon is the remaining gap. Concurrent writers and stable IDs across devices: done for the API surface.

2. **Real roles** — CAC / OIDC groups for FSR, engineering, QA. The header toggle is a teaching device and a security hole.

3. **Official schema ingest** — Map a real 00-25-107 / JDRS export. The invented `TechnicalAssistanceRequest` XML is a stand-in because no public schema exists.

4. **Nemotron callbacks** — Local Nemotron (Ollama) drafts the callback in the unit's voice, grounded only in `findGaps()`. Refuse-if-ungrounded. Deterministic scoring stays in front of the model.

5. **Brain Book signatures** — Ingest good/bad logs + lab notes into versioned signatures (MDS / block / OFP / ICD). Match the attached log against signatures instead of free-text hypotheses.

6. **Log decode** — Parse the attached log to events *before* the LLM sees residue. Today we only store a boolean + a canned excerpt.

7. **Audit trail** — Who changed status, who overrode the hollowness gate, what the 107 looked like at each hop. Required for any airworthiness-adjacent process.

8. **CUI / classification handling** — Field 107s are often CUI. The public demo must never hold real ones. Production needs a classified-enclave story, not a Vercel public site.

9. **Multi-user queue** — Notifications, assignment, SLAs for emergency vs routine. Prototype is single-browser.

10. **Observability** — Structured ingest/triage events (not LGTM yet). Measure: % of inbound 107s still hollow after first callback, time-to-solid, QA bounce rate.
