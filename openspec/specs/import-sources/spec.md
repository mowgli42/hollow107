# Import sources (validated)

## Purpose

The same ingest path accepts XML from the webpage, a local inbox folder, or an API client.

## Requirements

- Webpage paste/drop calls `POST /api/ingest?source=web`.
- Folder scan reads `data/inbox/*.xml`, ingests, moves successes to `data/processed` and failures to `data/failed`.
- Folder scan is local-only; on Vercel it returns 501 and tells the caller to POST `/api/ingest`.
- API ingest accepts raw XML, JSON `{xml, sourceName}`, or multipart `file`.
- Foreign or empty XML is rejected; the import run records ok/failed counts for the status strip.

## Out of scope (future)

- Watched network shares
- Signed JDRS packages
