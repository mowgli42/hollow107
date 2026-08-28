# Triage hollowness (validated)

## Purpose

Show how bad a field 107 can be before anyone diagnoses.

## Scoring

Hollowness is `round(gaps / 12 * 100)`. 0 = complete, 100 = empty.

Required presence:

1. requestType (TAR or MAR)
2. unit
3. pocName
4. identity (MDS **or** part number)
5. serialNumber
6. ofp
7. description — at least 40 characters, and slogans like "box failed" / "please advise" under 80 characters still count as a gap
8. firstSeen
9. lastKnownGood
10. alreadyTried
11. missionImpact
12. evidence — log attached **or** a no-log reason

Bands: solid ≤ 20, thin ≤ 55, else hollow.

## Gate

- Hollow/thin cases start in `awaiting-context`.
- Solid cases start in `ready-for-engineer`.
- Each gap produces a callback question the FSR can answer in-place.

## Out of scope (future)

- LLM-written callback narrative (Nemotron bead)
- Weighting some gaps higher than others
- Learned thresholds from historical 107s
