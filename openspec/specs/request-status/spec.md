# Request status (validated)

## Purpose

Every request shows status, criticality, and how long it has gone unanswered. The chrome shows the last ingest result. Color is never the only signal.

## Requirements

- Queue rows and the case header show labeled chips: Status, Criticality, Wait, Hollowness.
- A persistent status strip reports Idle / Working / Updated / Error plus open and critical counts.
- The strip is a live region (`aria-live=polite`).
- Sort open work by criticality, then unanswered duration.

## Out of scope (future)

- SLA calendars per MDS
- SMS / Mattermost alerts
