# Hollow107

TAR/MAR triage queue. Ingest a 107 as XML, keep users/timeline/logs on the envelope, and show **status, unanswered time, and criticality** on every row.

Live: [hollow107.vercel.app](https://hollow107.vercel.app)

Not a technical order, not JDRS, not an airworthy disposition. Invented `TechnicalAssistanceRequest` schema.

## Use it

- **Queue** `/` — open work, darkest first (criticality then wait).
- **Ingest** `/ingest` — paste/drop XML, or scan `data/inbox`.
- **Teams** `/t/fsr` `/t/engineer` `/t/qa` `/t/ops` — filtered landings. Create more with `POST /api/teams`.
- **Case** `/cases/:id` — workbench + envelope (people, timeline, logs, XML).

Status chips are labeled (not color-only). The strip under the header is the live ingest/queue status.

## Import

| Door | How |
|---|---|
| Webpage | paste or drop `.xml` |
| Folder | `data/inbox/*.xml` then **Scan inbox folder**, or `npm run import:watch` |
| API | `POST /api/ingest` (XML, JSON `{xml,sourceName}`, or multipart) |

Folder import is local. Vercel has no inbox; use the webpage or the API.

## Team APIs

```
GET  /api/teams
POST /api/teams          # { slug, name, role, blurb, statuses[], unitFilter? }
GET  /api/teams/:slug
GET  /api/teams/:slug/cases
GET  /api/cases
GET  /api/cases/:id
GET  /api/cases/:id/envelope
GET  /api/cases/:id/response.xml
GET  /api/status
POST /api/ingest
POST /api/import/folder  # local only
```

## Data plan

XML in/out. Envelope beside it. See `docs/DATA-PLAN.md`.

## Stack

TanStack Start, React 19, Tailwind v4, PGLite (or Neon when `DATABASE_URL` is set). Auth off; rows unowned.

## Specs

| Artifact | Path |
|---|---|
| OpenSpec | `openspec/` |
| Gherkin | `features/` |
| Data plan | `docs/DATA-PLAN.md` |
| Beads | `beads/roadmap.md` |
| Samples | `public/samples/` |

## License

MIT. Do not put real CUI or classified 107s in this app.
