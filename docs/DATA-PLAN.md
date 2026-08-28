# Data plan — XML interchange, envelope beside it

A field 107 **request** and **response** travel as XML. Everything used to
troubleshoot a case is stored next to that XML, not stuffed into it.

## Two layers

| Layer | Format | What it is |
|---|---|---|
| Interchange | `TechnicalAssistanceRequest` / `TechnicalAssistanceResponse` | The 107 itself: fields the unit sent, callback questions, disposition |
| Envelope | Postgres / PGLite tables | Users, timeline, logs, import provenance, derived wait/criticality |

The UI and team APIs read the envelope. A downstream system that only speaks
107 can `GET /api/cases/:id/response.xml`.

## Why the split

Logs, names, and “who changed status at 02:14” are troubleshooting data. They
do not belong in the TAR schema, and they must survive even if the XML is
rewritten on callback. The unanswered clock and criticality are derived from
envelope timestamps + the XML `priority` field.

## Tables

```
teams              display profiles (slug, role, statuses, unit filter)
cases              scored 107 + workflow status + unanswered_since
case_actors        submitter / assignee / watcher (not in XML)
case_events        timeline (ingest, status, field_update, note, xml_response, artifact)
case_artifacts     log excerpts, later screenshots
case_xml_messages  inbound request + outbound callback/disposition XML
import_runs        last web / folder / API ingest result (status strip)
```

`cases.tar` is JSON of the parsed XML so the workbench can edit fields without
round-tripping XML on every keystroke. The original inbound XML is kept on
`cases.raw_xml` and in `case_xml_messages`.

## Derived fields (not stored as source of truth)

- **Unanswered** — `now - unanswered_since` while the case is open. Clock starts
  at `submittedAt` (or ingest time). Resets on a status change. Stops on close
  or reject.
- **Criticality**
  - emergency + unanswered ≥ 4h → `critical`
  - emergency → `high`
  - hollowness ≥ 80 and unanswered ≥ 24h → `high`
  - unanswered ≥ 48h → `watch`
  - else `routine`

Recomputed on read so aging does not need a cron.

## Import paths

1. **Webpage** — paste or drop XML → `POST /api/ingest?source=web`
2. **Folder** — drop `*.xml` in `data/inbox` → `POST /api/import/folder` or
   `node scripts/folder-import.mjs --watch` (local only; Vercel has no inbox)
3. **API** — `POST /api/ingest` with XML, JSON `{xml, sourceName}`, or multipart

All three write the same envelope.

## Team displays

`POST /api/teams` with `{ slug, name, role, blurb, statuses[], unitFilter? }`
creates:

- landing page `/t/:slug`
- filtered JSON `/api/teams/:slug/cases`

Seeded: `fsr`, `engineer`, `qa`, `ops`. Other UIs (a shop-floor board, a
squadron wall) consume the JSON; they do not need this React app.

## Auth / tenancy

Auth is off. Rows are unowned (world-readable in preview). Production needs
CAC/OIDC and CUI handling before real 107s land here — see `beads/roadmap.md`.

## Classification

Do not put real CUI or classified 107s in this app.
