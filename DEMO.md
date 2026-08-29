# DEMO

Hollow107 — queue, not a pitch.

Live: https://hollow107.vercel.app  
Repo: https://github.com/mowgli42/hollow107

## Two-minute path

1. Open the app. Dark queue, status strip at the top.
2. **Load samples**. Ghost (emergency, unanswered since 12 Aug) should show **Critical** and a long wait.
3. Open the ghost. Envelope tab: submitter, timeline, inbound XML. Request tab: FSR fills gaps; engineer start stays locked.
4. Open the solid case. Switch to **Engineer**, start resolution, add a hypothesis, submit for QA. Switch to **QA**, close.
5. Open `/t/fsr` vs `/t/engineer` — different landings, same cases, filtered.

Drop `public/samples/ghost.xml` into `data/inbox` and hit **Scan inbox folder** to try folder import.

## Commands

```bash
npm test
npm run dev
npm run import:watch   # sidecar: data/inbox → POST /api/ingest
npm run build
```
