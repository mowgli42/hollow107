# Envelope beside XML (validated)

## Purpose

XML is the 107 interchange. Users, timeline, logs, and wait/criticality live on an envelope next to it.

## Requirements

- Ingest stores inbound XML, parsed fields, a submitter actor, and a timeline event.
- Attached logs are stored as artifacts, not inside the TAR XML.
- Each status change writes a timeline event and a new outbound `TechnicalAssistanceResponse` XML.
- `GET /api/cases/:id/envelope` returns actors, events, artifacts, and XML messages.
- `GET /api/cases/:id/response.xml` returns the current response XML only.
- Unanswered time and criticality are derived on read (emergency ≥ 4h unanswered = critical).

## Out of scope (future)

- Binary attachments
- Official JDRS schema
- CUI enclaves
