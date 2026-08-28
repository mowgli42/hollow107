# Team displays (validated)

## Purpose

Each team gets a unique landing page and a JSON feed so other UIs can be built
without forking this app.

## Requirements

- Seeded displays: `fsr`, `engineer`, `qa`, `ops`.
- `POST /api/teams` creates or updates a display: slug, name, default role, blurb, status filter, optional unit filter.
- Landing URL is `/t/:slug`. Queue JSON is `/api/teams/:slug/cases`.
- Cases are not copied per team; the display filters the shared queue.
- Opening a team landing sets the workbench role to that display's role.

## Out of scope (future)

- Per-team auth
- Push notifications
