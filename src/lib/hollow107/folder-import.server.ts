import { mkdir, readdir, readFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { recordImportRun, saveIngestedCase } from "./store.server.ts";

export function dataDirs(root = process.cwd()) {
  return {
    inbox: join(root, "data", "inbox"),
    processed: join(root, "data", "processed"),
    failed: join(root, "data", "failed"),
  };
}

export function folderImportAvailable(): boolean {
  return !process.env.VERCEL;
}

async function moveTo(dir: string, from: string, name: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  const dest = join(dir, `${Date.now()}-${name}`);
  await rename(from, dest);
}

export async function importInboxFolder(root = process.cwd()) {
  if (!folderImportAvailable()) {
    throw new Error("Folder import is local-only. POST XML to /api/ingest.");
  }
  const dirs = dataDirs(root);
  await mkdir(dirs.inbox, { recursive: true });
  await mkdir(dirs.processed, { recursive: true });
  await mkdir(dirs.failed, { recursive: true });
  const names = (await readdir(dirs.inbox)).filter((n) => n.toLowerCase().endsWith(".xml"));
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  let filesOk = 0;
  const ingested: { id: string; sourceName: string }[] = [];

  for (const name of names) {
    const path = join(dirs.inbox, name);
    try {
      const xml = await readFile(path, "utf8");
      const rec = await saveIngestedCase(xml, name, { sourceKind: "folder", teamSlug: "fsr" });
      await moveTo(dirs.processed, path, name);
      filesOk += 1;
      ingested.push({ id: rec.id, sourceName: name });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "import failed";
      errors.push(`${name}: ${msg}`);
      try {
        await moveTo(dirs.failed, path, name);
      } catch {
        /* leave in inbox if move fails */
      }
    }
  }

  const finishedAt = new Date().toISOString();
  const run = await recordImportRun({
    sourceKind: "folder",
    status: errors.length && !filesOk ? "error" : "ok",
    message: names.length
      ? `Scanned ${names.length} file${names.length === 1 ? "" : "s"} · ${filesOk} ok · ${errors.length} failed`
      : "Inbox empty",
    filesOk,
    filesFailed: errors.length,
    startedAt,
    finishedAt,
  });
  return { run, ingested, errors };
}
