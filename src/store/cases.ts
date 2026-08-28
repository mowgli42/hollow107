import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ingestXml,
  scoreTar,
  type CaseRecord,
  type CaseStatus,
  type Hypothesis,
  type Role,
  type Tar107,
} from "@/lib/hollow107";
import { assertTransition } from "@/lib/hollow107/workflow.ts";
import { GHOST_XML, SOLID_XML, THIN_XML } from "@/lib/hollow107/fixtures.ts";

type Store = {
  role: Role;
  cases: CaseRecord[];
  setRole: (role: Role) => void;
  ingest: (xml: string, sourceName?: string) => CaseRecord;
  loadSamples: () => void;
  move: (id: string, to: CaseStatus) => void;
  updateTar: (id: string, patch: Partial<Tar107>) => void;
  addHypothesis: (id: string, text: string, killCheck: string) => void;
  setHypothesisStatus: (id: string, hypId: string, status: Hypothesis["status"]) => void;
  setNotes: (id: string, which: "engineerNotes" | "qaNotes", value: string) => void;
  clear: () => void;
};

function patchCases(cases: CaseRecord[], id: string, fn: (c: CaseRecord) => CaseRecord): CaseRecord[] {
  return cases.map((c) => (c.id === id ? fn(c) : c));
}

export const useCases = create<Store>()(
  persist(
    (set, get) => ({
      role: "fsr",
      cases: [],
      setRole: (role) => set({ role }),
      ingest: (xml, sourceName) => {
        const rec = ingestXml(xml, sourceName);
        set({ cases: [rec, ...get().cases] });
        return rec;
      },
      loadSamples: () => {
        const samples = [
          ingestXml(GHOST_XML, "ghost-box-failed.xml"),
          ingestXml(THIN_XML, "thin-nav-align.xml"),
          ingestXml(SOLID_XML, "solid-cold-soak.xml"),
        ];
        set({ cases: samples });
      },
      move: (id, to) => {
        const rec = get().cases.find((c) => c.id === id);
        if (!rec) throw new Error("Unknown case");
        assertTransition(rec, to, get().role);
        set({ cases: patchCases(get().cases, id, (c) => ({ ...c, status: to })) });
      },
      updateTar: (id, patch) => {
        set({
          cases: patchCases(get().cases, id, (c) => {
            const tar = { ...c.tar, ...patch };
            const scored = scoreTar(tar);
            return {
              ...c,
              tar,
              gaps: scored.gaps,
              hollowness: scored.hollowness,
              questions: scored.questions,
              title: tar.description.trim().slice(0, 72) || c.title,
            };
          }),
        });
      },
      addHypothesis: (id, text, killCheck) => {
        const hyp: Hypothesis = {
          id: `h-${Date.now().toString(36)}`,
          text,
          killCheck,
          status: "open",
        };
        set({
          cases: patchCases(get().cases, id, (c) => ({ ...c, hypotheses: [...c.hypotheses, hyp] })),
        });
      },
      setHypothesisStatus: (id, hypId, status) => {
        set({
          cases: patchCases(get().cases, id, (c) => ({
            ...c,
            hypotheses: c.hypotheses.map((h) => (h.id === hypId ? { ...h, status } : h)),
          })),
        });
      },
      setNotes: (id, which, value) => {
        set({ cases: patchCases(get().cases, id, (c) => ({ ...c, [which]: value })) });
      },
      clear: () => set({ cases: [] }),
    }),
    { name: "hollow107-cases" },
  ),
);
