import { useMemo, useState } from "react";
import {
  LABELS,
  NO_LOG_NA,
  TRIAGE_FIELDS,
  TRIAGE_FIELD_COUNT,
  canPatchTar,
  logDisposition,
  type CaseRecord,
  type LogDisposition,
  type Tar107,
  type TriageField,
  triageSuggestions,
} from "@/lib/hollow107";
import { useCaseMutations, useOpsCases } from "@/hooks/use-ops";
import { useOpsUi } from "@/store/ops";
import { cn } from "@/lib/utils";

type Props = { rec: CaseRecord };

export function GapFill({ rec }: Props) {
  const mutate = useCaseMutations(rec.id);
  const role = useOpsUi((s) => s.role);
  const { data: cases } = useOpsCases();
  const suggestions = useMemo(() => triageSuggestions(cases ?? []), [cases]);
  const editable = canPatchTar(role, rec.status);
  const done = TRIAGE_FIELD_COUNT - rec.gaps.length;
  const completePct = Math.round((done / TRIAGE_FIELD_COUNT) * 100);
  const gapFields = new Set(rec.gaps.map((g) => g.field));

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
            {done}/{TRIAGE_FIELD_COUNT} required · {rec.hollowness}% hollow
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-elevated" aria-hidden>
          <div className="h-full bg-ok transition-[width] duration-200" style={{ width: `${completePct}%` }} />
        </div>
      </div>

      {TRIAGE_FIELDS.map((field) => {
        const gap = rec.gaps.find((g) => g.field === field);
        const question =
          rec.questions.find((q) => q.field === field)?.question ?? `Provide ${LABELS[field]}.`;
        const complete = !gapFields.has(field);
        return (
          <div
            key={field}
            className={cn(
              "rounded-md border px-3 py-2.5",
              complete ? "border-ok/30 bg-ok/5" : "border-border bg-bg-elevated",
            )}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase">
                {LABELS[field]}
              </span>
              {!complete && (
                <span className="rounded-sm bg-warn/15 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-warn uppercase">
                  Required
                </span>
              )}
              {complete && (
                <span className="rounded-sm bg-ok/15 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-ok uppercase">
                  Done
                </span>
              )}
              <FieldInfo label={LABELS[field]} why={gap?.why ?? ""} question={question} />
            </div>
            <TriageInput
              rec={rec}
              field={field}
              onApply={apply}
              units={suggestions.units}
              pocs={suggestions.pocs}
            />
          </div>
        );
      })}
    </div>
  );
}

function FieldInfo({ label, why, question }: { label: string; why: string; question: string }) {
  const [open, setOpen] = useState(false);
  if (!why) return null;
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

function TriageInput({
  rec,
  field,
  onApply,
  units,
  pocs,
}: {
  rec: CaseRecord;
  field: TriageField;
  onApply: (patch: Partial<Tar107>) => void;
  units: string[];
  pocs: string[];
}) {
  const tar = rec.tar;
  const inputClass = "min-h-9 w-full rounded-md border border-border-strong bg-bg px-2.5 text-sm";
  const listId = `${rec.id}-${field}-suggestions`;

  if (field === "evidence") {
    return <LogPicker tar={tar} onApply={onApply} />;
  }

  if (field === "unit" || field === "pocName") {
    const options = field === "unit" ? units : pocs;
    return (
      <>
        <input
          className={inputClass}
          list={listId}
          defaultValue={field === "unit" ? tar.unit : tar.pocName}
          placeholder={field === "unit" ? "e.g. 77 MXS" : "e.g. SSgt Reyes"}
          onBlur={(e) => onApply({ [field]: e.target.value } as Partial<Tar107>)}
        />
        <datalist id={listId}>
          {options.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      </>
    );
  }

  const value = field === "description" ? tar.description : tar.missionImpact;
  return (
    <textarea
      rows={field === "description" ? 3 : 2}
      className={cn(inputClass, "py-2")}
      defaultValue={value}
      placeholder={
        field === "description"
          ? "What failed, when, and in what mode?"
          : "Emergency vs routine — what is blocked?"
      }
      onBlur={(e) => onApply({ [field]: e.target.value } as Partial<Tar107>)}
    />
  );
}

function LogPicker({ tar, onApply }: { tar: Tar107; onApply: (patch: Partial<Tar107>) => void }) {
  const mode = logDisposition(tar);
  const inputClass = "min-h-9 w-full rounded-md border border-border-strong bg-bg px-2.5 text-sm";

  function pick(next: LogDisposition) {
    if (next === "attached") onApply({ logAttached: true, noLogReason: "" });
    if (next === "na") onApply({ logAttached: false, noLogReason: NO_LOG_NA });
    if (next === "missing") onApply({ logAttached: false, noLogReason: tar.noLogReason === NO_LOG_NA ? "" : tar.noLogReason });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "attached", label: "Log attached" },
            { id: "missing", label: "Missing log" },
            { id: "na", label: "N/A" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => pick(option.id)}
            className={cn(
              "min-h-9 rounded-md border px-3 text-xs font-medium",
              mode === option.id
                ? "border-accent/50 bg-accent/15 text-accent"
                : "border-border text-fg-muted hover:border-border-strong",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {mode === "missing" && (
        <input
          className={inputClass}
          placeholder="Why is the log missing?"
          defaultValue={tar.noLogReason === NO_LOG_NA ? "" : tar.noLogReason}
          onBlur={(e) => onApply({ logAttached: false, noLogReason: e.target.value })}
        />
      )}
    </div>
  );
}
