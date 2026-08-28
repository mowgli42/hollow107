import type { CaseRecord, RequestType, Tar107 } from "@/lib/hollow107";
import { useCases } from "@/store/cases";

type Props = { rec: CaseRecord };

export function GapFill({ rec }: Props) {
  const updateTar = useCases((s) => s.updateTar);

  if (rec.gaps.length === 0) {
    return (
      <p className="rounded-md border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">
        Context is complete. Send this to engineering when ready.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-pretty text-fg-muted">
        Answer the missing fields. Hollowness updates as you type. Engineering stays
        blocked until the score drops to 20% or below.
      </p>
      {rec.questions.map((q) => (
        <label key={q.field} className="block space-y-2">
          <span className="block font-mono text-xs tracking-widest text-accent uppercase">{q.field}</span>
          <span className="block text-sm font-medium text-fg">{q.question}</span>
          <GapInput rec={rec} field={q.field} onApply={(patch) => updateTar(rec.id, patch)} />
        </label>
      ))}
    </div>
  );
}

function GapInput({
  rec,
  field,
  onApply,
}: {
  rec: CaseRecord;
  field: string;
  onApply: (patch: Partial<Tar107>) => void;
}) {
  const tar = rec.tar;
  if (field === "requestType") {
    return (
      <select
        className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
        value={tar.requestType}
        onChange={(e) => onApply({ requestType: e.target.value as RequestType })}
      >
        <option value="">Select…</option>
        <option value="TAR">TAR — engineering disposition</option>
        <option value="MAR">MAR — depot maintenance</option>
      </select>
    );
  }
  if (field === "identity") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className="min-h-11 rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
          placeholder="MDS"
          value={tar.mds}
          onChange={(e) => onApply({ mds: e.target.value })}
        />
        <input
          className="min-h-11 rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
          placeholder="Part number"
          value={tar.partNumber}
          onChange={(e) => onApply({ partNumber: e.target.value })}
        />
      </div>
    );
  }
  if (field === "evidence") {
    return (
      <div className="space-y-2">
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={tar.logAttached}
            onChange={(e) => onApply({ logAttached: e.target.checked })}
          />
          Log attached
        </label>
        {!tar.logAttached && (
          <input
            className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
            placeholder="Why is there no log?"
            value={tar.noLogReason}
            onChange={(e) => onApply({ noLogReason: e.target.value })}
          />
        )}
      </div>
    );
  }
  const key = field as keyof Tar107;
  const value = String(tar[key] ?? "");
  const multiline = field === "description" || field === "alreadyTried" || field === "missionImpact";
  if (multiline) {
    return (
      <textarea
        rows={3}
        className="w-full rounded-md border border-border-strong bg-bg-elevated px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onApply({ [key]: e.target.value } as Partial<Tar107>)}
      />
    );
  }
  return (
    <input
      className="min-h-11 w-full rounded-md border border-border-strong bg-bg-elevated px-3 text-sm"
      value={value}
      onChange={(e) => onApply({ [key]: e.target.value } as Partial<Tar107>)}
    />
  );
}
