import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCases,
  fetchEnvelope,
  fetchStatus,
  fetchTeamCases,
  fetchTeams,
  ingestXmlApi,
  loadSamplesApi,
  mutateCase,
  scanInboxApi,
} from "@/lib/api";
import { useOpsUi } from "@/store/ops";

export function useOpsStatus() {
  return useQuery({ queryKey: ["status"], queryFn: fetchStatus, refetchInterval: 4000 });
}

export function useOpsCases() {
  return useQuery({ queryKey: ["cases"], queryFn: fetchCases, refetchInterval: 5000 });
}

export function useOpsTeams() {
  return useQuery({ queryKey: ["teams"], queryFn: fetchTeams });
}

export function useTeamQueue(slug: string) {
  return useQuery({
    queryKey: ["team-cases", slug],
    queryFn: () => fetchTeamCases(slug),
    enabled: Boolean(slug),
    refetchInterval: 5000,
  });
}

export function useEnvelope(id: string) {
  return useQuery({
    queryKey: ["envelope", id],
    queryFn: () => fetchEnvelope(id),
    enabled: Boolean(id),
  });
}

function useInvalidateOps() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["status"] }),
      qc.invalidateQueries({ queryKey: ["cases"] }),
      qc.invalidateQueries({ queryKey: ["team-cases"] }),
      qc.invalidateQueries({ queryKey: ["envelope"] }),
    ]);
}

export function useIngestMutation() {
  const invalidate = useInvalidateOps();
  const setActivity = useOpsUi((s) => s.setActivity);
  return useMutation({
    mutationFn: ({ xml, sourceName }: { xml: string; sourceName: string }) => ingestXmlApi(xml, sourceName, "web"),
    onMutate: ({ sourceName }) => setActivity({ state: "working", message: `Ingesting ${sourceName}…` }),
    onSuccess: (rec) => {
      setActivity({
        state: "ok",
        message: `${rec.sourceName} ingested · ${rec.status} · hollowness ${rec.hollowness}%`,
      });
      void invalidate();
    },
    onError: (err) =>
      setActivity({ state: "error", message: err instanceof Error ? err.message : "Ingest failed" }),
  });
}

export function useScanInboxMutation() {
  const invalidate = useInvalidateOps();
  const setActivity = useOpsUi((s) => s.setActivity);
  return useMutation({
    mutationFn: scanInboxApi,
    onMutate: () => setActivity({ state: "working", message: "Scanning inbox folder…" }),
    onSuccess: (data) => {
      const run = (data as { run?: { message: string } }).run;
      setActivity({ state: "ok", message: run?.message || "Inbox scanned" });
      void invalidate();
    },
    onError: (err) =>
      setActivity({ state: "error", message: err instanceof Error ? err.message : "Folder scan failed" }),
  });
}

export function useSamplesMutation() {
  const invalidate = useInvalidateOps();
  const setActivity = useOpsUi((s) => s.setActivity);
  return useMutation({
    mutationFn: () => loadSamplesApi(true),
    onMutate: () => setActivity({ state: "working", message: "Loading sample 107s…" }),
    onSuccess: (cases) => {
      setActivity({ state: "ok", message: `Loaded ${cases.length} sample cases` });
      void invalidate();
    },
    onError: (err) =>
      setActivity({ state: "error", message: err instanceof Error ? err.message : "Could not load samples" }),
  });
}

export function useCaseMutations(id: string) {
  const invalidate = useInvalidateOps();
  const role = useOpsUi((s) => s.role);
  const setActivity = useOpsUi((s) => s.setActivity);
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => mutateCase(id, { ...body, role, actorName: role }),
    onMutate: () => setActivity({ state: "working", message: "Updating case…" }),
    onSuccess: (rec) => {
      setActivity({ state: "ok", message: `${rec.id} · ${rec.status}` });
      void invalidate();
    },
    onError: (err) =>
      setActivity({ state: "error", message: err instanceof Error ? err.message : "Update failed" }),
  });
}
