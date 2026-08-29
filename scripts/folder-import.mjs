#!/usr/bin/env node
/**
 * Local inbox watcher. Drops *.xml from data/inbox onto POST /api/ingest.
 * Serverless hosts cannot watch a folder — use this sidecar or the Scan inbox button.
 *
 *   node scripts/folder-import.mjs --once
 *   node scripts/folder-import.mjs --watch
 */
import { mkdir, readdir, readFile, rename } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const inbox = join(root, "data", "inbox");
const processed = join(root, "data", "processed");
const failed = join(root, "data", "failed");
const base = process.env.HOLLOW107_URL || "http://127.0.0.1:8080";
const once = process.argv.includes("--once");
const intervalMs = Number(process.env.FOLDER_IMPORT_INTERVAL_MS || 4000);

async function scan() {
  await mkdir(inbox, { recursive: true });
  await mkdir(processed, { recursive: true });
  await mkdir(failed, { recursive: true });
  const names = (await readdir(inbox)).filter((n) => n.toLowerCase().endsWith(".xml"));
  for (const name of names) {
    const path = join(inbox, name);
    const xml = await readFile(path, "utf8");
    try {
      const res = await fetch(`${base}/api/ingest?source=folder&team=fsr`, {
        method: "POST",
        headers: { "content-type": "application/xml" },
        body: xml,
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || res.statusText);
      await rename(path, join(processed, `${Date.now()}-${name}`));
      console.log(`[folder-import] ok ${name} → ${body.case?.id ?? "?"}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "failed";
      console.error(`[folder-import] fail ${name}: ${msg}`);
      try {
        await rename(path, join(failed, `${Date.now()}-${name}`));
      } catch {
        /* keep in inbox */
      }
    }
  }
  return names.length;
}

if (once) {
  scan()
    .then((n) => {
      console.log(`[folder-import] scanned ${n} file(s)`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else {
  console.log(`[folder-import] watching ${inbox} → ${base}`);
  setInterval(() => {
    scan().catch((err) => console.error(err));
  }, intervalMs);
  scan().catch((err) => console.error(err));
}
