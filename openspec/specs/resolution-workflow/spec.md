# Resolution workflow (validated)

## Roles

Local toggle, not authentication: `fsr` | `engineer` | `qa`.

## Transitions

| From | To | Who | Extra gate |
|---|---|---|---|
| awaiting-context | ready-for-engineer | FSR | hollowness ≤ 20 |
| awaiting-context | ready-for-engineer | QA | override allowed |
| ready-for-engineer | in-resolution | Engineer | — |
| in-resolution | qa-review | Engineer | — |
| qa-review | in-resolution | Engineer | send back |
| qa-review | closed | QA | hollowness ≤ 20 |
| qa-review / awaiting-context | rejected | QA | — |
| * | awaiting-context | FSR or QA | send back for context |
| closed / rejected | * | none | terminal |

Engineer cannot start a hollow case. QA cannot close a hollow case.

## Engineer work

Add hypotheses (cause + kill-check) and notes. No Brain Book matching in this slice.

## QA work

Read hypotheses and engineer notes, add QA notes, close or reject.
