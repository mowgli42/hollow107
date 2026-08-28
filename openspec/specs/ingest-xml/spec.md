# Ingest XML (validated)

## Purpose

Accept a `TechnicalAssistanceRequest` XML document (invented schema, not an official 107) and produce a case record with parsed fields.

## Requirements

- Root element must be `TechnicalAssistanceRequest` or `tar107`.
- Empty or foreign XML is rejected with an error, not silently ingested.
- Missing child tags become empty strings; `logAttached` is true only for `true` / `yes` / `1`.
- CDATA inside tags is unwrapped.
- No XML parser dependency — regex extractors so the unit tests run in Node without DOMParser.

## Out of scope (future)

- Official JDRS / IMDS schema
- Digital signatures, attachments as binary
- Multi-file packages
