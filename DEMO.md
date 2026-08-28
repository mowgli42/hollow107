# DEMO

Hollow107 — see how empty a field 107 really is.

Live: https://hollow107.vercel.app  
Repo: https://github.com/mowgli42/hollow107

## Two-minute path

1. Open the app. The hero already scores the ghost 107 ("Box failed. Please advise ASAP.").
2. Click **Load teaching set**. You land on the queue, hollow first.
3. Open the ghost case. Twelve gaps, engineer start is locked. Switch the header to **Engineer** — still locked. That is the point.
4. Switch back to **FSR**. Open the solid case (GPS-1 cold soak). Switch to **Engineer**, **Start resolution**, add a hypothesis + kill-check, **Submit for QA**.
5. Switch to **QA**. Read the notes. **Close**. Try the same close on the ghost (still hollow) — it will refuse.

Paste or drop your own `TechnicalAssistanceRequest` XML from the ingest page. Samples live at `/samples/ghost.xml`, `/samples/thin.xml`, `/samples/solid.xml`.

## Screenshot walkthrough

| Step | File |
|---|---|
| Ingest / ghost hero | `docs/demo/01-ingest.png` |
| Queue, hollow first | `docs/demo/02-queue.png` |
| Ghost as FSR — 12 callbacks | `docs/demo/03-ghost-fsr.png` |
| Ghost as engineer — blocked | `docs/demo/04-ghost-engineer-blocked.png` |
| Solid as engineer | `docs/demo/05-solid-engineer.png` |
| Solid as QA | `docs/demo/06-solid-qa.png` |

## Commands

```bash
npm test          # includes src/lib/hollow107/hollow107.test.ts
npm run dev       # local preview
npm run build
```

## Review without a laptop

- Sample logs: `docs/demo/test-run.log` (unit tests) and `public/samples/solid-gps1.log` (attached field log)
- OpenSpec: `openspec/`
- Gherkin: `features/` (`@validated` vs `@future`)
- Production rebuild: `beads/roadmap.md`
