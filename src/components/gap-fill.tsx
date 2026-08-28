import { useState } from "react";
import { LABELS, NO_LOG_NA, canPatchTar, type CaseRecord, type RequestType, type Tar107 } from "@/lib/hollow107";
import { useCaseMutations } from "@/hooks/use-ops";
import { useOpsUi } from "@/store/ops";
import { cn } from "@/lib/utils";

const TRIAGE_FIELDS = 12;

type Props = { rec: CaseRecord };

export function GapFill({ rec }: Props) {
  const mutate = useCaseMutations(rec.id);
  const role = useOpsUi((s) => s.role);
  const editable = canPatchTar(role, rec.status);
  const done = TRIAGE_FIELDS - rec.gaps.length;
  const completePct = Math.round((done / TRIAGE_FIELDS) * 100);

  if (!editable) {
    return (
      <p className="text-sm text-fg-subtle">
        Triage editing is limited to FSR while the ticket is in triage.
      </p>
    );
  }

  if (rec.gaps.length === 0) {
    return (
      <p className="rounded-md border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">
        All required fields complete. Send this to engineering when ready.
      </p>
    );
  }

  function apply(patch: Partial<Tar107>) {
    mutate.mutate({ action: "patch", patch });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-bg-subtle px-3 py-2">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-mono tracking-widest text-fg-subtle uppercase">Triage walkthrough</span>
          <span className="tabular-nums text-fg-muted">
            {done}/{TRIAGE_FIELDS} required · {rec.hollowness}% hollow
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-elevated" aria-hidden>
          <div className="h-full bg-ok transition-[width] duration-200" style={{ width: `${completePct}%` }} />
        </div>
      </div>

      {rec.gaps.map((gap) => {
        const question = rec.questions.find((q) => q.field === gap.field)?.question ?? `Provide ${gap.label}.`;
        return (
          <div key={gap.field} className="rounded-md border border-border bg-bg-elevated px-3 py-2.5">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase">
                {LABELS[gap.field] ?? gap.label}
              </span>
              <span className="rounded-sm bg-warn/15 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-warn uppercase">
                Required
              </span>
              <FieldInfo label={gap.label} why={gap.why} question={question} />
            </div>
            <GapInput rec={rec} field={gap.field} onApply={apply} />
          </div>
        );
      })}
    </div>
  );
}

function FieldInfo({ label, why, question }: { label: string; why: string; question: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ms-auto">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Why we need ${label}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
          open
            ? "border-accent/50 bg-accent/15 text-accent"
            : "border-border text-fg-subtle hover:border-border-strong hover:text-fg-muted",
        )}
      >
        i
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 rounded-md border border-border bg-bg-subtle p-2.5 text-sm">
          <p className="text-fg-muted">{why}</p>
          <p className="text-fg">{question}</p>
        </div>
      )}
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
  const inputClass = "min-h-9 w-full rounded-md border border-border-strong bg-bg px-2.5 text-sm";

  if (field === "requestType") {
    return (
      <select
        className={inputClass}
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
          className={inputClass}
          placeholder="MDS"
          defaultValue={tar.mds}
          onBlur={(e) => onApply({ mds: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Part number"
          defaultValue={tar.partNumber}
          onBlur={(e) => onApply({ partNumber: e.target.value })}
        />
      </div>
    );
  }
  if (field === "evidence") {
    const naSelected = tar.noLogReason.trim() === NO_LOG_NA;
    return (
      <div className="space-y-2">
        <label className="flex min-h-9 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={tar.logAttached}
            onChange={(e) => onApply({ logAttached: e.target.checked, noLogReason: e.target.checked ? "" : tar.noLogReason })}
          />
          Log attached
        </label>
        {!tar.logAttached && (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onApply({ logAttached: false, noLogReason: NO_LOG_NA })}
                className={cn(
                  "min-h-9 rounded-md border px-3 text-xs font-medium",
                  naSelected
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-border text-fg-muted hover:border-border-strong",
                )}
              >
                N/A — no digital interface
              </button>
            </div>
            {!naSelected && (
              <input
                className={inputClass}
                placeholder="Why is there no log?"
                defaultValue={tar.noLogReason}
                onBlur={(e) => onApply({ noLogReason: e.target.value })}
              />
            )}
          </>
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
        rows={2}
        className={cn(inputClass, "py-2")}
        defaultValue={value}
        onBlur={(e) => onApply({ [key]: e.target.value } as Partial<Tar107>)}
      />
    );
  }
  return (
    <input
      className={inputClass}
      defaultValue={value}
      onBlur={(e) => onApply({ [key]: e.target.value } as Partial<Tar107>)}
    />
  );
}
